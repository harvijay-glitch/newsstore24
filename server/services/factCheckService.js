const verifiedSources = [
  "reuters", "associated press", "ap news", "bbc", "the hindu", "indian express",
  "ndtv", "hindustan times", "times of india", "bloomberg", "financial times", "cnbc",
  "the guardian", "washington post", "new york times", "al jazeera", "phys.org",
];

const rumorTerms = ["rumor", "rumour", "unverified", "unconfirmed claim", "fake news", "hoax"];
const developingTerms = ["breaking", "developing", "preliminary", "investigation", "live updates", "reportedly"];

export const classifyFactCheckStatus = ({ title = "", description = "", source = "" }) => {
  const text = `${title} ${description}`.toLowerCase();
  const sourceName = String(source).toLowerCase();

  if (rumorTerms.some((term) => text.includes(term))) {
    return { status: "Rumor", reason: "The article contains language indicating an unverified claim or rumor." };
  }

  if (developingTerms.some((term) => text.includes(term))) {
    return { status: "Developing", reason: "This is a developing story and details may change as reporting continues." };
  }

  if (verifiedSources.some((name) => sourceName.includes(name))) {
    return { status: "Verified", reason: "Published by a recognised news source; this is not an independent fact-check." };
  }

  return { status: "Developing", reason: "The source or available details need further confirmation." };
};
