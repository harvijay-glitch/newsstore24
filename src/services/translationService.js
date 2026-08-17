import API from "./api";

const translateWithGoogle = async (text, target) => {
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(String(text).slice(0, 450))}`);
  if (!response.ok) throw new Error("Google translation request failed");
  const data = await response.json();
  return String(data?.[0]?.map((part) => part?.[0] || "").join("") || "").trim();
};

export const translateTexts = async (texts, target) => {
  const response = await API.post("/translate", { texts, target, source: "en" });
  const translatedTexts = response.data.translatedTexts || texts;
  if (target === "en") return translatedTexts;

  const result = [...translatedTexts];
  for (let index = 0; index < texts.length; index += 3) {
    const batch = texts.slice(index, index + 3);
    await Promise.all(batch.map(async (text, offset) => {
      if (!text || result[index + offset] !== text) return;
      try {
        const translated = await translateWithGoogle(text, target);
        if (translated && translated.toLowerCase() !== text.toLowerCase()) result[index + offset] = translated;
      } catch {
        // Keep the provider response when the browser fallback is unavailable.
      }
    }));
  }
  return result;
};
