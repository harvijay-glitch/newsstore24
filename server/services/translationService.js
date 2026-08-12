import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const TRANSLATE_URL = "https://api.mymemory.translated.net/get";

const languageNames = {
  hi: "Hindi", mr: "Marathi", bn: "Bengali", ta: "Tamil", ml: "Malayalam",
  gu: "Gujarati", te: "Telugu", kn: "Kannada", or: "Odia", en: "English",
};

const translateWithGemini = async ({ text, target }) => {
  if (!process.env.GEMINI_API_KEY) return "";

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_TRANSLATION_MODEL || "gemini-2.5-flash",
    contents: `Translate the following news text into ${languageNames[target] || target}. Preserve all facts, names, numbers, punctuation, and formatting. Return only the translation.\n\n${text}`,
  });
  return String(response.text || "").trim();
};

export const translateText = async ({ text, target, source = "en" }) => {
  if (!text?.trim() || source === target) return text;

  try {
    const response = await axios.get(TRANSLATE_URL, {
      params: { q: text.slice(0, 450), langpair: `${source}|${target}` },
      timeout: 15000,
    });
    const translation = String(response.data?.responseData?.translatedText || "").trim();
    if (translation) return translation;
  } catch (error) {
    console.warn("MyMemory translation unavailable:", error.message);
  }

  const fallbackTranslation = await translateWithGemini({ text, target });
  if (fallbackTranslation) return fallbackTranslation;
  throw new Error("No translation provider is available");
};
