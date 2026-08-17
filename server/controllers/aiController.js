import { answerNewsQuestion, createArticleEnrichmentFallback, generateArticleEnrichment } from "../services/openRouterService.js";
import News from "../models/News.js";

const getArticleInputFromText = (text = "") => ({
  title: text.match(/Title:\s*([^\n]+)/i)?.[1]?.trim() || "News article",
  description: text.match(/Description:\s*([^\n]+)/i)?.[1]?.trim() || text,
  content: text.match(/Content:\s*([\s\S]*)/i)?.[1]?.trim() || "",
});

const toSummaryResponse = (enrichment, cached = false) => ({
  success: true,
  cached,
  summary: enrichment.aiSummary,
  aiSummary: enrichment.aiSummary,
  keyPoints: enrichment.keyPoints,
  keyFacts: enrichment.keyFacts,
  whyThisMatters: enrichment.whyThisMatters || enrichment.whyItMatters,
  whyItMatters: enrichment.whyItMatters || enrichment.whyThisMatters,
  aiResponse: enrichment,
});

export const getSummary = async (req, res) => {
  try {
    console.log("===== AI REQUEST =====");

    const { text } = req.body;

    console.log("Text Received:");
    console.log(text);

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "News text is required",
      });
    }

    const enrichment = await generateArticleEnrichment(getArticleInputFromText(text));
    console.log("AI enrichment generated in one request");
    res.json(toSummaryResponse(enrichment));
  } catch (error) {
    console.error("===== AI CONTROLLER ERROR =====");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI Summary Failed",
    });
  }
};

export const getNewsSummary = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    if (news.aiSummary && news.aiStatus === "completed") {
      const cachedEnrichment = {
        ...createArticleEnrichmentFallback(news),
        aiSummary: news.aiSummary,
        summary: news.aiSummary,
        keyPoints: news.keyPoints?.length ? news.keyPoints : createArticleEnrichmentFallback(news).keyPoints,
        keyFacts: news.keyFacts?.length ? news.keyFacts : createArticleEnrichmentFallback(news).keyFacts,
        whyThisMatters: news.whyThisMatters || news.whyItMatters || createArticleEnrichmentFallback(news).whyThisMatters,
        whyItMatters: news.whyItMatters || news.whyThisMatters || createArticleEnrichmentFallback(news).whyItMatters,
      };
      return res.json(toSummaryResponse(cachedEnrichment, true));
    }

    const claimed = await News.findOneAndUpdate(
      {
        _id: news._id,
        aiStatus: { $in: ["pending", "failed"] },
        $or: [{ aiRequestCount: { $lt: 1 } }, { aiRequestCount: { $exists: false } }],
      },
      { $set: { aiStatus: "processing", aiRequestedAt: new Date() }, $inc: { aiRequestCount: 1 } },
      { new: true }
    );
    if (!claimed) return res.status(409).json({ success: false, message: "AI generation is already in progress or has already been requested." });

    try {
      const enrichment = await generateArticleEnrichment(news);
      await News.findByIdAndUpdate(news._id, {
        title: enrichment.rewrittenTitle,
        description: enrichment.aiSummary,
        aiSummary: enrichment.aiSummary,
        seoTitle: enrichment.seoTitle,
        metaDescription: enrichment.metaDescription,
        keyPoints: enrichment.keyPoints,
        keyFacts: enrichment.keyFacts,
        whyThisMatters: enrichment.whyThisMatters,
        whyItMatters: enrichment.whyItMatters,
        sentiment: enrichment.sentiment,
        keywords: enrichment.keywords,
        aiResponse: enrichment,
        aiStatus: "completed",
        aiError: "",
        publishStatus: "published",
      });
      return res.json(toSummaryResponse(enrichment));
    } catch (generationError) {
      const fallback = createArticleEnrichmentFallback(news);
      await News.findByIdAndUpdate(news._id, {
        aiSummary: fallback.aiSummary,
        keyPoints: fallback.keyPoints,
        keyFacts: fallback.keyFacts,
        whyThisMatters: fallback.whyThisMatters,
        whyItMatters: fallback.whyItMatters,
        aiStatus: "failed",
        aiError: String(generationError.message || "AI generation failed").slice(0, 500),
      });
      return res.status(502).json({ success: false, message: "AI generation failed", ...toSummaryResponse(fallback) });
    }
  } catch (error) {
    console.error("NewsStore24 summary error:", error);
    res.status(500).json({ success: false, message: "AI Summary Failed" });
  }
};

export const askAboutNews = async (req, res) => {
  try {
    const { title, content, question } = req.body;
    if (!title || !question) return res.status(400).json({ success: false, message: "Title and question are required" });
    const answer = await answerNewsQuestion({ title, content: content || "", question });
    res.json({ success: true, answer });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(500).json({ success: false, message: "AI chat failed" });
  }
};
