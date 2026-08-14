import axios from "axios";
import crypto from "crypto";
import News from "../models/News.js";
import DailyNewsProcessing from "../models/DailyNewsProcessing.js";
import { generatePendingAISummaries } from "./aiWorker.js";
import { calculateAIImportance } from "./aiScoreService.js";
import { classifyFactCheckStatus } from "./factCheckService.js";
import { classifyTrendingBadge } from "./trendingBadgeService.js";
import { calculateReadingTime, createCanonicalKey, isLikelyDuplicateStory } from "./editorialService.js";
import { postToX } from "./xService.js";

const backfillAIScores = async () => {
  const articlesWithoutScore = await News.find({ aiImportance: { $exists: false } }).limit(100);

  await Promise.all(articlesWithoutScore.map(async (article) => {
    const { score, factors } = calculateAIImportance(article);
    await News.findByIdAndUpdate(article._id, {
      aiImportance: score,
      aiScoreFactors: factors,
      trendingScore: Math.round(factors.trending * 10),
    });
  }));
};

const backfillFactCheckStatuses = async () => {
  const articlesWithoutStatus = await News.find({ factCheckStatus: { $exists: false } }).limit(100);

  await Promise.all(articlesWithoutStatus.map(async (article) => {
    const factCheck = classifyFactCheckStatus(article);
    await News.findByIdAndUpdate(article._id, {
      factCheckStatus: factCheck.status,
      factCheckReason: factCheck.reason,
    });
  }));
};

const backfillTrendingBadges = async () => {
  const articlesWithoutBadge = await News.find({ trendingBadge: { $exists: false } }).limit(100);

  await Promise.all(articlesWithoutBadge.map(async (article) => {
    const trendBadge = classifyTrendingBadge(article);
    await News.findByIdAndUpdate(article._id, {
      trendingBadge: trendBadge.badge,
      trendingBadgeReason: trendBadge.reason,
    });
  }));
};

const DAILY_IMPORT_LIMIT = 100; // Allow hourly updates (roughly 1 per hour)

const getProcessingDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.NEWS_DAILY_TIMEZONE || "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const reserveDailyImportSlot = async (processingDate) => {
  // Create the daily record once, then atomically reserve one of its ten slots.
  try {
    await DailyNewsProcessing.updateOne(
      { processingDate },
      { $setOnInsert: { processingDate, importedCount: 0, aiCompletedCount: 0, aiFailedCount: 0 } },
      { upsert: true }
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }
  return DailyNewsProcessing.findOneAndUpdate(
    { processingDate, importedCount: { $lt: DAILY_IMPORT_LIMIT } },
    { $inc: { importedCount: 1 } },
    { new: true }
  );
};

const releaseDailyImportSlot = async (processingDate) => {
  await DailyNewsProcessing.updateOne(
    { processingDate, importedCount: { $gt: 0 } },
    { $inc: { importedCount: -1 } }
  );
};

// Fetch News
export const fetchAndSaveNews = async (category = "General", generateSummaries = true) => {
  try {
    const processingDate = getProcessingDate();
    const dailyRecord = await DailyNewsProcessing.findOne({ processingDate }).lean();
    if (dailyRecord?.importedCount >= DAILY_IMPORT_LIMIT) {
      console.log(`[News import ${processingDate}] Daily limit reached (10/10); no GNews or OpenRouter call made.`);
      return await News.find({ category: { $regex: `^${category}$`, $options: "i" }, publishStatus: "published", aiStatus: "completed" }).sort({ publishedAt: -1 });
    }

    const normalizedCategory = category.toLowerCase();
    const isMarketCategory = ["crypto", "stock"].includes(normalizedCategory);
    const response = await axios.get(
      isMarketCategory ? "https://gnews.io/api/v4/search" : "https://gnews.io/api/v4/top-headlines",
      {
        params: {
          country: "in",
          lang: "en",
          ...(isMarketCategory ? { q: normalizedCategory } : { category: normalizedCategory }),
          max: Math.min(Math.max(Number(process.env.GNEWS_FETCH_SIZE || 50), 10), 100),
          apikey: process.env.GNEWS_API_KEY,
        },
      }
    );

    const articles = response.data.articles || [];
    const stats = { received: articles.length, duplicates: 0, saved: 0, aiCompleted: 0, aiFailed: 0 };
    const savedIds = [];
    console.log(`[News import ${processingDate}] GNews returned ${stats.received} articles.`);

    for (const article of articles) {
      if (savedIds.length >= 1) break; // Fetch only 1 article per hour
      const canonicalKey = createCanonicalKey(article.title);
      const sourceContentHash = crypto.createHash("sha256")
        .update(`${article.title || ""}\n${article.description || ""}\n${article.content || ""}`.toLowerCase().replace(/\s+/g, " "))
        .digest("hex");
      const exists = await News.findOne({
        $or: [{ url: article.url }, { sourceContentHash }, ...(canonicalKey ? [{ canonicalKey }] : [])],
      });

      if (exists) {
        stats.duplicates += 1;
        console.log("Already Exists:", article.title);
        continue;
      }

      const recentArticles = await News.find({
        publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).select("title description originalTitle originalDescription").limit(150);
      if (recentArticles.some((savedArticle) => isLikelyDuplicateStory(article, savedArticle))) {
        stats.duplicates += 1;
        console.log("Duplicate story skipped:", article.title);
        continue;
      }

      const dailySlot = await reserveDailyImportSlot(processingDate);
      if (!dailySlot) {
        console.log(`[News import ${processingDate}] Daily limit reached while selecting new articles.`);
        break;
      }

      // Keep the provider category so the navigation page receives its own news.
      const detectedCategory = normalizedCategory;
      const aiScore = calculateAIImportance({
        title: article.title,
        description: article.description,
        source: article.source?.name,
        category: detectedCategory,
        publishedAt: article.publishedAt,
      });
      const factCheck = classifyFactCheckStatus({
        title: article.title,
        description: article.description,
        source: article.source?.name,
      });
      const trendBadge = classifyTrendingBadge({
        title: article.title,
        description: article.description,
        publishedAt: article.publishedAt,
        aiImportance: aiScore.score,
        aiScoreFactors: aiScore.factors,
      });

      try {
        const savedArticle = await News.create({
        title: article.title,
        originalTitle: article.title,
        description: article.description,
        originalDescription: article.description,
        canonicalKey,
        sourceContentHash,
        content: article.content,
        image: article.image,
        url: article.url,
        source: article.source?.name || "",
        author: article.author || article.source?.name || "",
        authorName: article.author || article.source?.name || "",
        category: detectedCategory,
        publishedAt: article.publishedAt,
        aiStatus: "pending",
        aiRequestCount: 0,
        publishStatus: "draft",
        readingTime: calculateReadingTime(`${article.description || ""} ${article.content || ""}`),
        aiImportance: aiScore.score,
        aiScoreFactors: aiScore.factors,
        factCheckStatus: factCheck.status,
        factCheckReason: factCheck.reason,
        trendingBadge: trendBadge.badge,
        trendingBadgeReason: trendBadge.reason,
        });
        savedIds.push(savedArticle._id);
        stats.saved += 1;

        // Post to X automatically
        postToX({
          title: savedArticle.title,
          url: savedArticle.url,
        }).catch((error) => console.error("Failed to post to X:", error.message));
      } catch (error) {
        await releaseDailyImportSlot(processingDate);
        if (error?.code === 11000) {
          stats.duplicates += 1;
          console.log("Duplicate URL skipped during save:", article.title);
          continue;
        }
        throw error;
      }

      console.log("Saved:", article.title);
    }

    await backfillAIScores();
    await backfillFactCheckStatuses();
    await backfillTrendingBadges();
    if (generateSummaries && savedIds.length) {
      const aiStats = await generatePendingAISummaries(savedIds, processingDate);
      stats.aiCompleted = aiStats.completed;
      stats.aiFailed = aiStats.failed;
    }
    const latestDailyRecord = await DailyNewsProcessing.findOne({ processingDate }).lean();
    console.log(`[News import ${processingDate}] received=${stats.received}, duplicates=${stats.duplicates}, saved=${stats.saved}, aiCompleted=${stats.aiCompleted}, aiFailed=${stats.aiFailed}, daily=${latestDailyRecord?.importedCount || 0}/${DAILY_IMPORT_LIMIT}.`);
    if ((latestDailyRecord?.importedCount || 0) >= DAILY_IMPORT_LIMIT) {
      console.log(`[News import ${processingDate}] Daily limit reached.`);
    }

    return await News.find({
      category: { $regex: `^${category}$`, $options: "i" },
      publishStatus: "published",
      aiStatus: "completed",
    }).sort({
      publishedAt: -1,
    });

  } catch (error) {
    console.error("News import failed:", error.message);
    return [];
  }
};

export const refreshAllNews = async (specificCategory = null) => {
  const categories = specificCategory ? [specificCategory] : ["general", "world", "business", "technology", "sports", "crypto", "stock"];

  for (const category of categories) {
    await fetchAndSaveNews(category, true);
  }

};

export const refreshLatestNews = async () => {
  await fetchAndSaveNews("general");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { deletedCount } = await News.deleteMany({
    $or: [
      { publishedAt: { $lt: sevenDaysAgo } },
      { publishedAt: null, createdAt: { $lt: sevenDaysAgo } },
    ],
  });

  if (deletedCount) console.log(`Removed ${deletedCount} news articles older than seven days.`);
};
