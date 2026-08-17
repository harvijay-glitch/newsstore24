import News from "../models/News.js";
import DailyNewsProcessing from "../models/DailyNewsProcessing.js";
import { createArticleEnrichmentFallback, generateArticleEnrichment } from "./openRouterService.js";
import { generateAndStoreArticleImage } from "./aiImageService.js";
import { isPublishable } from "./editorialService.js";

export const generatePendingAISummaries = async (newsIds = [], processingDate = "") => {
  try {
    // Only articles created by the current import run are eligible. Failed
    // articles are intentionally never selected again automatically.
    if (!newsIds.length) return { completed: 0, failed: 0 };

    // Older articles were created before aiRequestCount existed. Treat a
    // missing value as zero so those articles do not remain drafts forever.
    const unrequestedFilter = { $or: [{ aiRequestCount: 0 }, { aiRequestCount: { $exists: false } }] };
    const pendingNews = await News.find({ _id: { $in: newsIds }, aiStatus: "pending", ...unrequestedFilter });

    if (!pendingNews.length) {
      return { completed: 0, failed: 0 };
    }

    console.log(`Found ${pendingNews.length} pending news...`);

    const processNews = async (news) => {
      const claimed = await News.findOneAndUpdate(
        { _id: news._id, aiStatus: "pending", ...unrequestedFilter },
        { $set: { aiStatus: "processing", aiRequestedAt: new Date() }, $inc: { aiRequestCount: 1 } },
        { new: true }
      );
      if (!claimed) return "skipped";

      try {
        console.log("Generating AI:", news.title);
        const enrichment = await generateArticleEnrichment(news);
        const imageResult = await generateAndStoreArticleImage({
          _id: news._id,
          title: enrichment.rewrittenTitle || news.title,
          description: enrichment.aiSummary || news.description,
          category: news.category,
        });

        const completedArticle = {
          ...news.toObject(),
          title: enrichment.rewrittenTitle,
          description: enrichment.aiSummary,
          aiSummary: enrichment.aiSummary,
          seoTitle: enrichment.seoTitle,
          whyThisMatters: enrichment.whyThisMatters,
          whyItMatters: enrichment.whyItMatters,
          metaDescription: enrichment.metaDescription,
          keyPoints: enrichment.keyPoints,
          keyFacts: enrichment.keyFacts,
          sentiment: enrichment.sentiment,
          keywords: enrichment.keywords,
          aiResponse: enrichment,
          generatedImageUrl: imageResult.generatedImageUrl || "",
        };
        if (!isPublishable(completedArticle)) throw new Error("AI quality check failed");

        await News.findByIdAndUpdate(news._id, {
          title: enrichment.rewrittenTitle,
          description: enrichment.aiSummary,
          aiSummary: enrichment.aiSummary,
          seoTitle: enrichment.seoTitle,
          whyThisMatters: enrichment.whyThisMatters,
          whyItMatters: enrichment.whyItMatters,
          metaDescription: enrichment.metaDescription,
          keyPoints: enrichment.keyPoints,
          keyFacts: enrichment.keyFacts,
          sentiment: enrichment.sentiment,
          keywords: enrichment.keywords,
          aiResponse: enrichment,
          trendingScore: Math.max(1, Math.round(100 - ((Date.now() - new Date(news.publishedAt || news.createdAt).getTime()) / 3600000) + (news.views || 0) * 2)),
          aiStatus: "completed",
          aiError: "",
          publishStatus: "published",
        });

        if (processingDate) await DailyNewsProcessing.updateOne(
          { processingDate },
          { $inc: { aiCompletedCount: 1 } }
        );

        console.log("AI Completed:", news.title);
        return "completed";
      } catch (err) {
        console.log("AI Failed:", news.title, "-", err.message);
        const fallback = createArticleEnrichmentFallback(news);

        // News availability must not depend on an optional AI provider. Keep
        // the source article visible when enrichment is unavailable, while
        // preserving the error for future diagnostics.
        await News.findByIdAndUpdate(news._id, {
          aiStatus: "completed",
          aiError: String(err.message || "AI enrichment failed").slice(0, 500),
          aiSummary: fallback.aiSummary,
          keyPoints: fallback.keyPoints,
          keyFacts: fallback.keyFacts,
          whyThisMatters: fallback.whyThisMatters,
          whyItMatters: fallback.whyItMatters,
          aiResponse: fallback,
          publishStatus: "published",
        });
        if (processingDate) await DailyNewsProcessing.updateOne(
          { processingDate },
          { $inc: { aiFailedCount: 1 } }
        );
        return "completed";
      }
    };

    // Keep requests sequential: this respects provider rate limits and makes
    // one claimed document equal exactly one OpenRouter request.
    const concurrency = 1;
    const results = [];
    for (let index = 0; index < pendingNews.length; index += concurrency) {
      results.push(...await Promise.all(pendingNews.slice(index, index + concurrency).map(processNews)));
    }
    return { completed: results.filter((result) => result === "completed").length, failed: results.filter((result) => result === "failed").length };
  } catch (err) {
    console.log(err);
    return { completed: 0, failed: 0 };
  }
};
