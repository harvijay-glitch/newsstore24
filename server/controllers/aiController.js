import { answerNewsQuestion, generateSummary } from "../services/openRouterService.js";
import News from "../models/News.js";

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

    const summary = await generateSummary(text);

    if (!summary) {
      return res.status(502).json({ success: false, message: "AI could not create a complete five-point summary. Please try again." });
    }

    console.log("AI Summary:");
    console.log(summary);

    res.json({
      success: true,
      summary,
    });
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
      return res.json({ success: true, summary: news.aiSummary, cached: true });
    }

    const text = `Title: ${news.title}\n\nDescription: ${news.description}\n\nContent: ${news.content || ""}`;
    const summary = await generateSummary(text);

    if (!summary) {
      return res.status(502).json({ success: false, message: "AI could not create a complete five-point summary. Please try again." });
    }

    await News.findByIdAndUpdate(news._id, {
      aiSummary: summary,
      aiStatus: "completed",
    });

    res.json({ success: true, summary, cached: false });
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
