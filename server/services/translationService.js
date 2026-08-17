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

const translateWithGoogleFallback = async ({ text, target, source }) => {
  const response = await axios.get("https://translate.googleapis.com/translate_a/single", {
    params: { client: "gtx", sl: source, tl: target, dt: "t", q: text.slice(0, 450) },
    timeout: 15000,
  });
  return String(response.data?.[0]?.map((part) => part?.[0] || "").join("") || "").trim();
};

export const translateText = async ({ text, target, source = "en" }) => {
  if (!text?.trim() || source === target) return text;

  try {
    const googleTranslation = await translateWithGoogleFallback({ text, target, source });
    if (googleTranslation && googleTranslation.toLowerCase() !== text.slice(0, 450).trim().toLowerCase()) return googleTranslation;
  } catch (error) {
    console.warn("Google translation unavailable:", error.message);
  }

  try {
    const response = await axios.get(TRANSLATE_URL, {
      params: { q: text.slice(0, 450), langpair: `${source}|${target}` },
      timeout: 15000,
    });
    const translation = String(response.data?.responseData?.translatedText || "").trim();
    if (translation && translation.toLowerCase() !== text.slice(0, 450).trim().toLowerCase()) return translation;
  } catch (error) {
    console.warn("MyMemory translation unavailable:", error.message);
  }

  const fallbackTranslation = await translateWithGemini({ text, target });
  if (fallbackTranslation && fallbackTranslation.toLowerCase() !== text.slice(0, 450).trim().toLowerCase()) return fallbackTranslation;
  throw new Error("No translation provider is available");
};
