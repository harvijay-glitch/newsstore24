import News from "../models/News.js";
import MediaAsset from "../models/MediaAsset.js";
import CmsPage from "../models/CmsPage.js";
import mongoose from "mongoose";
import { fetchAndSaveNews } from "../services/newsService.js";

const categoryKeywords = {
  world: "world|global|international|china|europe|ukraine|israel",
  business: "business|market|economy|company|bank|inflation|trade|shares",
  crypto: "crypto|bitcoin|ethereum|blockchain|digital asset",
  stock: "stock|share market|equities|sensex|nifty|wall street|ipo",
  technology: "technology|tech|software|ai|digital|google|microsoft|cyber",
  sports: "sports|cricket|football|match|tournament|player|olympic",
};

// =========================
// Get Latest News
// =========================
export const fetchNews = async (req, res) => {
  try {
    const allowedCategories = ["general", "world", "business", "technology", "sports", "crypto", "stock", "india", "entertainment", "science"];
    const hasCategoryFilter = Boolean(req.query.category);
    const requestedCategory = String(req.query.category || "general").toLowerCase();
    const category = allowedCategories.includes(requestedCategory) ? requestedCategory : "general";
    const existingFilter = { publishStatus: "published", aiStatus: "completed" };
    if (hasCategoryFilter) existingFilter.category = { $regex: `^${category}$`, $options: "i" };

    // Serve saved news immediately. GNews/OpenRouter refreshes must not block
    // the homepage while external providers or AI enrichment are slow.
    let articles = await News.find(existingFilter).sort({ publishedAt: -1 }).limit(50).lean();
    const refreshPromise = fetchAndSaveNews(category);
    if (!articles.length) {
      articles = await refreshPromise;
    } else {
      refreshPromise.catch((refreshError) => console.error("Background news refresh failed:", refreshError.message));
    }

    // Keep category pages usable if the external news provider is temporarily
    // empty or unavailable. Older saved articles can still be matched by the
    // category field or their headline/description.
    if (hasCategoryFilter && articles.length === 0) {
      const keywordPattern = categoryKeywords[category];
      const fallbackFilters = keywordPattern
        ? {
            $and: [
              { publishStatus: "published", aiStatus: "completed" },
              { $or: [
                { category: { $regex: `^${category}$`, $options: "i" } },
                { title: { $regex: keywordPattern, $options: "i" } },
                { description: { $regex: keywordPattern, $options: "i" } },
              ] },
            ],
          }
        : { category: { $regex: `^${category}$`, $options: "i" }, publishStatus: "published", aiStatus: "completed" };

      articles = await News.find(fallbackFilters)
        .sort({ publishedAt: -1 })
        .limit(10);
    }

    // The home page uses /news without a category.  A provider can occasionally
    // return only a couple of General articles, which leaves empty card slots.
    // Fill the home feed with the newest saved stories from other categories.
    if (!hasCategoryFilter && articles.length < 10) {
      const existingIds = articles.map((article) => article._id);
      const additionalArticles = await News.find({
        _id: { $nin: existingIds },
        publishStatus: "published",
        aiStatus: "completed",
      })
        .sort({ publishedAt: -1 })
        .limit(10 - articles.length);

      articles = [...articles, ...additionalArticles]
        .sort((first, second) => new Date(second.publishedAt || 0) - new Date(first.publishedAt || 0));
    }

    res.json({
      success: true,
      total: articles.length,
      articles,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
    });
  }
};

// =========================
// Search News
// =========================
export const searchNews = async (req, res) => {
  try {
    const { q, category, from, to } = req.query;

    if (!q) {
      return res.json({
        success: true,
        total: 0,
        articles: [],
      });
    }

    const filters = {
      publishStatus: "published",
      aiStatus: "completed",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { aiSummary: { $regex: q, $options: "i" } },
      ],
    };
    if (category) filters.category = { $regex: `^${String(category)}$`, $options: "i" };
    if (from || to) filters.publishedAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };

    const articles = await News.find(filters).sort({
      publishedAt: -1,
    });

    res.json({
      success: true,
      total: articles.length,
      articles,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Search Failed",
    });
  }
};

// =========================
// Toggle Bookmark
// =========================
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    news.bookmarked = !news.bookmarked;

    await news.save();

    res.json({
      success: true,
      bookmarked: news.bookmarked,
      message: news.bookmarked
        ? "News Saved"
        : "News Removed",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// Get Saved News
// =========================
export const getBookmarkedNews = async (req, res) => {
  try {
    const articles = await News.find({
      bookmarked: true,
    }).sort({
      publishedAt: -1,
    });

    res.json({
      success: true,
      total: articles.length,
      articles,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarked news",
    });
  }
};

export const getRelatedNews = async (req, res) => {
  try {
    const current = await News.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { slug: req.params.id },
      ],
    });
    if (!current) return res.status(404).json({ success: false, message: "News not found" });
    const articles = await News.find({
      _id: { $ne: current._id },
      category: current.category,
      publishStatus: "published",
      aiStatus: "completed",
    }).select("title seoTitle slug source category publishedAt image").sort({ publishedAt: -1 }).limit(4).lean();
    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Related news failed" });
  }
};

export const getNewsArticle = async (req, res) => {
  try {
    const article = await News.findOne({
      $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }],
      publishStatus: "published",
      aiStatus: "completed",
    }).lean();
    if (!article) return res.status(404).json({ success: false, message: "News not found" });

    // Reading an article must never fail because an older document cannot pass
    // current schema validation. Increment views directly and do not make this
    // ancillary update block the article response.
    News.updateOne({ _id: article._id }, { $inc: { views: 1 } })
      .catch((viewError) => console.error("Article view increment failed:", viewError.message));

    res.json({ success: true, article });
  } catch (error) {
    console.error("News article load failed:", error.message);
    res.status(500).json({ success: false, message: "News article could not be loaded" });
  }
};

export const getGeneratedNewsImage = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.fileId)) return res.status(404).end();
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "newsImages" });
  const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.fileId));
  stream.on("file", (file) => res.set("Content-Type", file.contentType || "image/webp"));
  stream.on("error", () => {
    if (!res.headersSent) res.status(404).end();
    else res.end();
  });
  stream.pipe(res);
};

export const getAuthorArticles = async (req, res) => {
  try {
    const author = String(req.params.name || "");
    const articles = await News.find({ $or: [{ author }, { authorName: author }], publishStatus: "published", aiStatus: "completed" })
      .sort({ publishedAt: -1 })
      .limit(30);
    res.json({ success: true, author, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Author articles could not be loaded" });
  }
};

export const getDailyBrief = async (req, res) => {
  const articles = await News.find({ publishStatus: "published", aiStatus: "completed" }).sort({ trendingScore: -1, views: -1, publishedAt: -1 }).limit(10);
  res.json({ success: true, articles });
};

export const getRecommendations = async (req, res) => {
  try {
    const articles = await News.find({ publishStatus: "published", aiStatus: "completed" })
      .sort({ aiImportance: -1, trendingScore: -1, publishedAt: -1 })
      .limit(8);
    res.json({ success: true, articles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Recommendations could not be loaded" });
  }
};

export const createAdminNews = async (req, res) => {
  try {
    const {
      title,
      category = "General",
      source = "",
      url = "",
      image = "",
      description = "",
      content = "",
      author = "",
      seoTitle = "",
      metaDescription = "",
      publishStatus = "draft",
      aiStatus = "pending",
      featured = false,
      publishedAt,
      aiSummary,
      keyPoints = [],
      keyFacts = [],
      whyThisMatters = "",
      whyItMatters = "",
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    const finalUrl = String(url || `https://inkl.news/${String(title).trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]+/g, "") || Date.now()}`).trim();
    const normalizedSlug = String(title).trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]+/g, "") || `news-${Date.now()}`;

    const existingSlugCount = await News.countDocuments({ slug: { $regex: `^${normalizedSlug}`, $options: "i" } });

    const item = await News.create({
      title: String(title).trim(),
      category: String(category || "General").trim(),
      source: String(source || "").trim(),
      url: finalUrl,
      image: String(image || "").trim(),
      description: String(description || "").trim(),
      content: String(content || "").trim(),
      author: String(author || "").trim(),
      seoTitle: String(seoTitle || "").trim(),
      metaDescription: String(metaDescription || "").trim(),
      publishStatus: ["draft", "published", "rejected"].includes(publishStatus) ? publishStatus : "draft",
      aiStatus: ["pending", "processing", "completed", "failed"].includes(aiStatus) ? aiStatus : "pending",
      featured: Boolean(featured),
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      aiSummary: String(aiSummary || "").trim(),
      keyPoints: Array.isArray(keyPoints) ? keyPoints.map(String).map((point) => point.trim()).filter(Boolean) : [],
      keyFacts: Array.isArray(keyFacts) ? keyFacts.map(String).map((fact) => fact.trim()).filter(Boolean) : [],
      whyThisMatters: String(whyThisMatters || whyItMatters || "").trim(),
      whyItMatters: String(whyItMatters || whyThisMatters || "").trim(),
      slug: `${normalizedSlug}${existingSlugCount ? `-${Date.now()}` : ""}`,
      views: 0,
      bookmarked: false,
    });

    res.status(201).json({
      success: true,
      message: item.publishStatus === "published" ? "News published successfully." : "Draft saved successfully.",
      news: {
        ...item.toObject(),
        status: item.publishStatus,
        aiStatus: item.aiStatus,
        featured: Boolean(item.featured),
      },
    });
  } catch (error) {
    console.error("Create admin news failed:", error.message);
    res.status(500).json({ success: false, message: "News could not be created." });
  }
};

export const getAdminNews = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const search = String(req.query.q || "").trim();
    const status = String(req.query.status || "").trim();
    const category = String(req.query.category || "").trim();

    const filters = {};
    if (status && status !== "all") filters.publishStatus = status;
    if (category && category !== "all") filters.category = { $regex: `^${category}$`, $options: "i" };
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const [news, total] = await Promise.all([
      News.find(filters)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      News.countDocuments(filters),
    ]);

    res.json({
      success: true,
      news: news.map((item) => ({
        ...item,
        status: item.publishStatus || "draft",
        aiStatus: item.aiStatus || "pending",
        featured: Boolean(item.featured),
      })),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("Admin news list failed:", error.message);
    res.status(500).json({ success: false, message: "News could not be loaded." });
  }
};

export const getAdminNewsById = async (req, res) => {
  try {
    const item = await News.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: "News item not found." });
    }

    res.json({
      success: true,
      news: {
        ...item,
        status: item.publishStatus || "draft",
        aiStatus: item.aiStatus || "pending",
        featured: Boolean(item.featured),
      },
    });
  } catch (error) {
    console.error("Admin news fetch failed:", error.message);
    res.status(500).json({ success: false, message: "News item could not be loaded." });
  }
};

export const updateAdminNews = async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "News item not found." });

    const {
      title,
      category,
      source,
      description,
      content,
      image,
      url,
      author,
      seoTitle,
      metaDescription,
      publishStatus,
      aiStatus,
      featured,
      publishedAt,
      aiSummary,
      keyPoints,
      keyFacts,
      whyThisMatters,
      whyItMatters,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    const validStatus = ["draft", "published", "rejected"].includes(publishStatus) ? publishStatus : item.publishStatus || "draft";
    const validAiStatus = ["pending", "processing", "completed", "failed"].includes(aiStatus) ? aiStatus : item.aiStatus || "pending";

    item.title = String(title).trim();
    item.category = String(category || item.category || "General").trim();
    item.source = String(source || item.source || "").trim();
    item.description = String(description ?? item.description ?? "");
    item.content = String(content ?? item.content ?? "");
    item.image = String(image ?? item.image ?? "");
    item.url = String(url || item.url || "").trim() || item.url;
    item.author = String(author || item.author || "").trim();
    item.seoTitle = String(seoTitle ?? item.seoTitle ?? "");
    item.metaDescription = String(metaDescription ?? item.metaDescription ?? "");
    if (aiSummary !== undefined) item.aiSummary = String(aiSummary || "").trim();
    if (keyPoints !== undefined) item.keyPoints = Array.isArray(keyPoints) ? keyPoints.map(String).map((point) => point.trim()).filter(Boolean) : [];
    if (keyFacts !== undefined) item.keyFacts = Array.isArray(keyFacts) ? keyFacts.map(String).map((fact) => fact.trim()).filter(Boolean) : [];
    if (whyThisMatters !== undefined || whyItMatters !== undefined) {
      const context = String(whyThisMatters || whyItMatters || "").trim();
      item.whyThisMatters = context;
      item.whyItMatters = context;
    }
    item.publishStatus = validStatus;
    item.aiStatus = validAiStatus;
    item.featured = Boolean(featured);

    if (publishedAt) {
      item.publishedAt = new Date(publishedAt);
    } else if (validStatus === "published" && !item.publishedAt) {
      item.publishedAt = new Date();
    }

    await item.save();

    res.json({
      success: true,
      message: "News item updated successfully.",
      news: {
        ...item.toObject(),
        status: item.publishStatus,
        aiStatus: item.aiStatus,
        featured: Boolean(item.featured),
      },
    });
  } catch (error) {
    console.error("Update admin news failed:", error.message);
    res.status(500).json({ success: false, message: "News item could not be updated." });
  }
};

export const deleteAdminNews = async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "News item not found." });

    await News.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "News item deleted successfully." });
  } catch (error) {
    console.error("Delete admin news failed:", error.message);
    res.status(500).json({ success: false, message: "News item could not be deleted." });
  }
};

export const toggleFeaturedAdminNews = async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "News item not found." });

    item.featured = !Boolean(item.featured);
    await item.save();

    res.json({
      success: true,
      featured: Boolean(item.featured),
      message: item.featured ? "News item marked as featured." : "News item removed from featured list.",
    });
  } catch (error) {
    console.error("Toggle featured admin news failed:", error.message);
    res.status(500).json({ success: false, message: "Featured status could not be updated." });
  }
};

export const getAdminPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const search = String(req.query.q || "").trim();
    const status = String(req.query.status || "").trim();
    const category = String(req.query.category || "").trim();

    const filters = {};
    if (status) filters.publishStatus = status;
    if (category) filters.category = { $regex: `^${category}$`, $options: "i" };
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const [posts, total] = await Promise.all([
      News.find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      News.countDocuments(filters),
    ]);

    res.json({
      success: true,
      posts: posts.map((post) => ({
        ...post,
        status: post.publishStatus,
        tags: Array.isArray(post.keywords) ? post.keywords : [],
        excerpt: post.description || "",
      })),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("Admin posts list failed:", error.message);
    res.status(500).json({ success: false, message: "Posts could not be loaded." });
  }
};

export const getAdminPostById = async (req, res) => {
  try {
    const post = await News.findById(req.params.id).lean();
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    res.json({
      success: true,
      post: {
        ...post,
        status: post.publishStatus,
        tags: Array.isArray(post.keywords) ? post.keywords : [],
        excerpt: post.description || "",
      },
    });
  } catch (error) {
    console.error("Admin post fetch failed:", error.message);
    res.status(500).json({ success: false, message: "Post could not be loaded." });
  }
};

export const createAdminPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      category = "General",
      content = "",
      description = "",
      image = "",
      seoTitle = "",
      metaDescription = "",
      tags = [],
      author = "NewsStore24 Editorial Desk",
      status = "draft",
      publishedAt,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({ success: false, message: "Category is required." });
    }

    const cleanSlug = String(slug || title).trim();
    const normalizedSlug = String(cleanSlug).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]+/g, "").replace(/-+/g, "-") || `post-${Date.now()}`;
    const finalSlug = normalizedSlug;
    const postCount = await News.countDocuments({ slug: finalSlug });

    const finalPost = await News.create({
      title: String(title).trim(),
      slug: finalSlug + (postCount ? `-${Date.now()}` : ""),
      category: String(category).trim(),
      content: String(content || ""),
      description: String(description || ""),
      image: String(image || ""),
      seoTitle: String(seoTitle || ""),
      metaDescription: String(metaDescription || ""),
      keywords: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : String(tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      author: String(author || "NewsStore24 Editorial Desk").trim(),
      publishStatus: status === "published" ? "published" : "draft",
      publishedAt: status === "published" ? new Date(publishedAt || Date.now()) : null,
      url: `${String(process.env.PUBLIC_SITE_URL || process.env.APP_URL || "https://www.newsstore24.com").replace(/\/$/, "")}/article/${finalSlug}`,
      source: "Admin CMS",
      originalTitle: String(title).trim(),
      aiStatus: "completed",
      aiSummary: String(description || ""),
      views: 0,
    });

    res.status(201).json({
      success: true,
      message: status === "published" ? "Post published successfully." : "Draft saved successfully.",
      post: {
        ...finalPost.toObject(),
        status: finalPost.publishStatus,
        tags: Array.isArray(finalPost.keywords) ? finalPost.keywords : [],
        excerpt: finalPost.description || "",
      },
    });
  } catch (error) {
    console.error("Create admin post failed:", error.message);
    res.status(500).json({ success: false, message: "Post could not be saved." });
  }
};

export const updateAdminPost = async (req, res) => {
  try {
    const post = await News.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    const {
      title,
      slug,
      category,
      content,
      description,
      image,
      seoTitle,
      metaDescription,
      tags,
      author,
      status,
      publishedAt,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    const nextSlug = String(slug || title).trim();
    const normalizedSlug = String(nextSlug).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]+/g, "").replace(/-+/g, "-") || `post-${Date.now()}`;
    const finalSlug = normalizedSlug;

    post.title = String(title).trim();
    post.slug = finalSlug;
    post.category = String(category || post.category || "General").trim();
    post.content = String(content || "");
    post.description = String(description || "");
    post.image = String(image || post.image || "");
    post.seoTitle = String(seoTitle || "");
    post.metaDescription = String(metaDescription || "");
    post.keywords = Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
    post.author = String(author || post.author || "NewsStore24 Editorial Desk").trim();
    post.publishStatus = status === "published" ? "published" : "draft";
    post.publishedAt = status === "published" ? new Date(publishedAt || post.publishedAt || Date.now()) : null;
    post.url = `${String(process.env.PUBLIC_SITE_URL || process.env.APP_URL || "https://www.newsstore24.com").replace(/\/$/, "")}/article/${post.slug}`;
    post.aiSummary = post.aiSummary || String(description || "");

    await post.save();

    res.json({
      success: true,
      message: status === "published" ? "Post updated and published." : "Draft updated successfully.",
      post: {
        ...post.toObject(),
        status: post.publishStatus,
        tags: Array.isArray(post.keywords) ? post.keywords : [],
        excerpt: post.description || "",
      },
    });
  } catch (error) {
    console.error("Update admin post failed:", error.message);
    res.status(500).json({ success: false, message: "Post could not be updated." });
  }
};

export const deleteAdminPost = async (req, res) => {
  try {
    const post = await News.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    await News.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete admin post failed:", error.message);
    res.status(500).json({ success: false, message: "Post could not be deleted." });
  }
};

export const getAnalytics = async (req, res) => {
  const [totalNews, totalPosts, published, drafts, totalViews, categories] = await Promise.all([
    News.countDocuments({ source: { $ne: "Admin CMS" } }),
    News.countDocuments({ source: "Admin CMS" }),
    News.countDocuments({ publishStatus: "published" }),
    News.countDocuments({ publishStatus: "draft" }),
    News.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
    News.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  res.json({ success: true, totalNews, totalPosts, published, drafts, totalViews: totalViews[0]?.total || 0, categories });
};

export const uploadMedia = async (req, res) => {
  try {
    const { name, mimeType, dataUrl, size } = req.body || {};
    if (!name || !mimeType || !String(mimeType).startsWith("image/") || !dataUrl || Number(size) > 2 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "Upload a valid image up to 2 MB." });
    }
    const asset = await MediaAsset.create({ name: String(name), mimeType: String(mimeType), dataUrl: String(dataUrl), size: Number(size) || 0 });
    res.status(201).json({ success: true, asset: { ...asset.toObject(), url: asset.dataUrl } });
  } catch (error) {
    console.error("Media upload failed:", error.message);
    res.status(500).json({ success: false, message: "Media could not be uploaded." });
  }
};

export const getMedia = async (req, res) => {
  const assets = await MediaAsset.find().sort({ createdAt: -1 }).select("name mimeType size dataUrl createdAt").limit(100).lean();
  res.json({ success: true, assets: assets.map((asset) => ({ ...asset, url: asset.dataUrl })) });
};

export const deleteMedia = async (req, res) => {
  await MediaAsset.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

const defaultPages = {
  about: { title: "About NewsStore24", content: "NewsStore24 helps readers understand important stories quickly with attributed reporting and AI-assisted context." },
  contact: { title: "Contact NewsStore24", content: "Contact the NewsStore24 team for corrections, feedback, and partnership enquiries." },
  privacy: { title: "Privacy Policy", content: "NewsStore24 respects your privacy. We use information only to operate, secure, and improve this service." },
  terms: { title: "Terms of Use", content: "Use NewsStore24 lawfully and verify important information against the original source." },
};

export const getCmsPage = async (req, res) => {
  const slug = String(req.params.slug).toLowerCase();
  const page = await CmsPage.findOne({ slug, status: "published" }).lean();
  res.json({ success: true, page: page || { slug, ...(defaultPages[slug] || { title: slug, content: "" }), status: "published" } });
};

export const getAdminPages = async (req, res) => {
  const pages = await CmsPage.find().sort({ slug: 1 }).lean();
  res.json({ success: true, pages });
};

export const upsertAdminPage = async (req, res) => {
  const slug = String(req.body.slug || "").trim().toLowerCase();
  if (!slug || !req.body.title) return res.status(400).json({ success: false, message: "Slug and title are required." });
  const page = await CmsPage.findOneAndUpdate(
    { slug },
    { $set: { title: String(req.body.title), content: String(req.body.content || ""), seoTitle: String(req.body.seoTitle || ""), metaDescription: String(req.body.metaDescription || ""), status: req.body.status === "draft" ? "draft" : "published" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, page });
};
