const trustedSources = [
  "reuters", "associated press", "ap news", "bbc", "the hindu", "indian express",
  "ndtv", "hindustan times", "times of india", "bloomberg", "financial times", "cnbc",
  "the guardian", "washington post", "new york times", "al jazeera", "phys.org",
];

const highImpactTerms = [
  "war", "election", "government", "policy", "court", "economy", "inflation", "market",
  "dengue", "outbreak", "health", "earthquake", "flood", "cyclone", "crash", "attack",
  "security", "climate", "ai", "artificial intelligence", "crypto", "stock", "india",
];

const highInterestTerms = [
  "breaking", "viral", "election", "india", "cricket", "bitcoin", "crypto", "stock",
  "iphone", "google", "microsoft", "openai", "ai", "dengue", "weather", "movie",
];

const clamp = (value, minimum = 0, maximum = 10) => Math.min(maximum, Math.max(minimum, value));

const countMatches = (text, terms) => terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);

export const calculateAIImportance = ({ title = "", description = "", source = "", publishedAt, views = 0, category = "" }) => {
  const text = `${title} ${description}`.toLowerCase();
  const sourceName = String(source).toLowerCase();
  const ageInHours = Math.max(0, (Date.now() - new Date(publishedAt || Date.now()).getTime()) / 3_600_000);
  const sourceQuality = trustedSources.some((name) => sourceName.includes(name)) ? 9 : sourceName ? 7 : 5;
  const freshness = clamp(10 - ageInHours / 16, 2, 10);
  const impact = clamp(3.5 + countMatches(text, highImpactTerms) * 1.35, 3.5, 10);
  const searchVolume = clamp(4 + countMatches(text, highInterestTerms) * 1.25 + (category === "sports" ? 0.5 : 0), 3, 10);
  const trending = clamp((freshness * 0.7) + Math.min(3, Math.log10(Number(views) + 1)) + (countMatches(text, highInterestTerms) * 0.25), 2, 10);
  const score = clamp(
    (trending * 0.3) + (sourceQuality * 0.2) + (impact * 0.25) + (searchVolume * 0.1) + (freshness * 0.15),
    1,
    10
  );

  return {
    score: Number(score.toFixed(1)),
    factors: {
      trending: Number(trending.toFixed(1)),
      sourceQuality: Number(sourceQuality.toFixed(1)),
      impact: Number(impact.toFixed(1)),
      searchVolume: Number(searchVolume.toFixed(1)),
      freshness: Number(freshness.toFixed(1)),
    },
  };
};
