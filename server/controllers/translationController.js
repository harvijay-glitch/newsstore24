import { translateText } from "../services/translationService.js";

export const translate = async (req, res) => {
  try {
    const { text, texts, target, source } = req.body;
    if (!target || (!text && !Array.isArray(texts))) return res.status(400).json({ success: false, message: "Text and target language are required" });

    if (Array.isArray(texts)) {
      const safeTexts = texts.slice(0, 50);
      const translatedTexts = [];
      for (let index = 0; index < safeTexts.length; index += 3) {
        const batch = safeTexts.slice(index, index + 3);
        const translatedBatch = await Promise.all(batch.map(async (item) => {
          try {
            return await translateText({ text: item, target, source });
          } catch (error) {
            console.warn("One text could not be translated:", error.message);
            return item;
          }
        }));
        translatedTexts.push(...translatedBatch);
      }
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
