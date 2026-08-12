const breakingTerms = ["breaking", "just in", "alert", "emergency", "live updates"];
const viralTerms = ["viral", "social media", "trending on", "internet reacts", "buzz"];

export const classifyTrendingBadge = ({ title = "", description = "", aiImportance = 0, aiScoreFactors = {}, publishedAt }) => {
  const text = `${title} ${description}`.toLowerCase();
  const ageInHours = Math.max(0, (Date.now() - new Date(publishedAt || Date.now()).getTime()) / 3_600_000);
  const score = Number(aiImportance) || 0;
  const trending = Number(aiScoreFactors.trending) || 0;

  if (breakingTerms.some((term) => text.includes(term)) && ageInHours <= 24) {
    return { badge: "Breaking", reason: "Recent breaking-news language was detected in this article." };
  }

  if (viralTerms.some((term) => text.includes(term)) && ageInHours <= 72) {
    return { badge: "Viral", reason: "The article contains signals associated with viral public interest." };
  }

  if (score >= 8 || trending >= 8) {
    return { badge: "Popular", reason: "This article has a high AI importance or trending score." };
  }

  return { badge: "Trending", reason: "This article is recent and has active news-interest signals." };
};
