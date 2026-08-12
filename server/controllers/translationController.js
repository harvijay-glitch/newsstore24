import { translateText } from "../services/translationService.js";

export const translate = async (req, res) => {
  try {
    const { text, texts, target, source } = req.body;
    if (!target || (!text && !Array.isArray(texts))) return res.status(400).json({ success: false, message: "Text and target language are required" });

    if (Array.isArray(texts)) {
      const safeTexts = texts.slice(0, 20);
      const translatedTexts = await Promise.all(safeTexts.map((item) => translateText({ text: item, target, source })));
      return res.json({ success: true, translatedTexts });
    }

    const translatedText = await translateText({ text, target, source });
    res.json({ success: true, translatedText });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Translation failed. Please try again shortly.",
    });
  }
};
