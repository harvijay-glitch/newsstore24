const categoryKeywords = {
  technology: ["ai", "technology", "software", "iphone", "google", "microsoft", "app", "digital", "cyber"],
  business: ["business", "market", "economy", "company", "bank", "inflation", "trade", "shares"],
  sports: ["cricket", "football", "match", "tournament", "sports", "player", "olympic"],
  entertainment: ["film", "movie", "actor", "actress", "music", "bollywood", "series"],
  science: ["science", "space", "nasa", "research", "climate", "health", "dengue"],
  india: ["india", "indian", "delhi", "mumbai", "uttar pradesh", "parliament", "bjp", "congress"],
  world: ["world", "global", "us ", "china", "europe", "ukraine", "israel", "international"],
};

export const createCanonicalKey = (title = "") => title
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .split(/\s+/)
  .filter((word) => word.length > 2 && !["the", "and", "for", "with", "from", "that"].includes(word))
  .slice(0, 12)
  .sort()
  .join("-");

export const detectCategory = ({ title = "", description = "", fallback = "general" }) => {
  const text = `${title} ${description}`.toLowerCase();
  const ranked = Object.entries(categoryKeywords)
    .map(([category, keywords]) => ({ category, score: keywords.filter((keyword) => text.includes(keyword)).length }))
    .sort((first, second) => second.score - first.score);
  return ranked[0]?.score ? ranked[0].category : String(fallback).toLowerCase();
};

export const calculateReadingTime = (text = "") => Math.max(1, Math.ceil(String(text).trim().split(/\s+/).filter(Boolean).length / 220));

const words = (text = "") => String(text).toLowerCase().match(/[a-z0-9]{3,}/g) || [];

export const isLikelyDuplicateStory = (incoming, existing) => {
  const incomingWords = new Set(words(`${incoming.title} ${incoming.description}`));
  const existingWords = new Set(words(`${existing.originalTitle || existing.title} ${existing.originalDescription || existing.description}`));
  if (!incomingWords.size || !existingWords.size) return false;
  const overlap = [...incomingWords].filter((word) => existingWords.has(word)).length;
  const similarity = overlap / Math.min(incomingWords.size, existingWords.size);
  return similarity >= 0.72;
};

const includesCopiedPhrase = (summary = "", source = "") => {
  const sourceText = ` ${String(source).toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const summaryWords = words(summary);
  for (let index = 0; index <= summaryWords.length - 8; index += 1) {
    if (sourceText.includes(` ${summaryWords.slice(index, index + 8).join(" ")} `)) return true;
  }
  return false;
};

export const isPublishable = (article) => {
  const summary = String(article.aiSummary || "").trim();
  const summaryWordCount = words(summary).length;
  const invalidText = /unable to generate|not available|as an ai|i cannot|lorem ipsum/i.test(summary);
  const keyPoints = Array.isArray(article.keyPoints) ? article.keyPoints : [];
  const keyFacts = Array.isArray(article.keyFacts) ? article.keyFacts : [];
  const keywords = Array.isArray(article.keywords) ? article.keywords : [];

  return Boolean(
    article.title?.trim()
    && article.description?.trim()
    && article.seoTitle?.trim()
    && article.metaDescription?.trim()
    && article.whyItMatters?.trim()
    && summaryWordCount >= 80 && summaryWordCount <= 120
    && !invalidText
    && !includesCopiedPhrase(summary, `${article.originalTitle || ""} ${article.originalDescription || ""} ${article.content || ""}`)
    && keyPoints.length >= 4 && keyPoints.length <= 6
    && keyFacts.length >= 3 && keyFacts.length <= 6
    && keywords.length >= 5 && keywords.length <= 10
    && ["positive", "neutral", "negative", "mixed"].includes(article.sentiment)
  );
};
