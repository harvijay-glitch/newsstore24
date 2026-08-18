import axios from "axios";

const appUrl = process.env.APP_URL || "https://newsstore24.com";

const normalizeText = (value, maxLength = 1000) => String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);

const normalizeList = (value, maxItems) => (Array.isArray(value)
  ? value.map((item) => normalizeText(item, 300)).filter(Boolean).slice(0, maxItems)
  : []);

export const ensureMinimumList = (value, fallback = [], minimum = 10, maximum = 10) => {
  const result = [...normalizeList(value, maximum), ...normalizeList(fallback, maximum)]
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, maximum);
  while (result.length < minimum) result.push(`Additional context should be confirmed from the original source (${result.length + 1}).`);
  return result;
};

export const ensureMinimumWhy = (value, fallback = "") => {
  const lines = normalizeText(value, 1000).split(/(?<=[.!?])\s+/).filter(Boolean);
  const fallbackLines = normalizeText(fallback, 1000).split(/(?<=[.!?])\s+/).filter(Boolean);
  const result = [...lines, ...fallbackLines].filter((line, index, items) => items.indexOf(line) === index);
  while (result.length < 10) result.push(`Review the original source for the latest context and updates (${result.length + 1}).`);
  return result.slice(0, 10).join("\n");
};

export const ensureMinimumSummary = (value, fallback = "") => {
  const lines = normalizeText(value, 1800).split(/(?<=[.!?])\s+/).filter(Boolean);
  const fallbackLines = normalizeText(fallback, 1800).split(/(?<=[.!?])\s+/).filter(Boolean);
  const result = [...lines, ...fallbackLines].filter((line, index, items) => items.indexOf(line) === index);
  while (result.length < 10) result.push(`Additional article context should be verified from the original source (${result.length + 1}).`);
  return result.slice(0, 10).join("\n");
};

export const createArticleEnrichmentFallback = ({ title = "", description = "", content = "" } = {}) => {
  const sourceDetail = normalizeText(description || content, 500) || "The original report contains limited published details.";
  const articleTitle = normalizeText(title, 110) || "This news story";
  return {
    rewrittenTitle: articleTitle,
    aiSummary: sourceDetail,
    summary: sourceDetail,
    keyPoints: [
      `The report concerns ${articleTitle}.`,
      `The available source description says: ${sourceDetail}`,
      "Additional details should be confirmed from the original source.",
      "The original source should be checked for later developments.",
      "The report should be read in its full published context.",
      "Important claims should be verified with the original publisher.",
      "Further reporting may add context to this developing story.",
      "Readers should distinguish confirmed information from later updates.",
      "The source remains the best place for follow-up details.",
      "This context is based on the available article information.",
    ],
    keyFacts: [sourceDetail, `The source article is titled: ${articleTitle}.`, "The available information comes from the attributed report.", "Further facts should be verified against the original source.", "The article contains the source description used for this brief.", "The report may be updated by its publisher.", "The available facts are limited to the supplied article.", "Readers should verify names, dates, and figures in the source.", "The original report provides the attribution for this information.", "Additional reporting may clarify unresolved details."],
    whyThisMatters: "Readers should review the original source for complete context and later updates. The story may develop as more information becomes available. Its wider impact depends on verified details and responses. Check the source again for follow-up reporting. The report should be read in its full published context. Important claims should be verified with the original publisher. Further reporting may add context to this developing story. Readers should distinguish confirmed information from later updates. The source remains the best place for follow-up details. This explanation is based on the available article information.",
    whyItMatters: "Readers should review the original source for complete context and later updates. The story may develop as more information becomes available. Its wider impact depends on verified details and responses. Check the source again for follow-up reporting. The report should be read in its full published context. Important claims should be verified with the original publisher. Further reporting may add context to this developing story. Readers should distinguish confirmed information from later updates. The source remains the best place for follow-up details. This explanation is based on the available article information.",
    sentiment: "neutral",
    keywords: [],
    seoTitle: articleTitle,
    metaDescription: sourceDetail.slice(0, 160),
  };
};

const parseJsonObject = (raw) => {
  const text = String(raw || "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
  const withoutFence = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  const candidate = withoutFence.slice(start, end + 1);
  for (const value of [candidate, candidate.replace(/,\s*([}\]])/g, "$1")]) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // Try the minimally repaired candidate before using the local fallback.
    }
  }
  return null;
};

export const generateArticleEnrichment = async ({ title = "", description = "", content = "" }) => {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      // Override this only with another OpenRouter :free model in deployment.
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
      max_tokens: 1300,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{
        role: "user",
        content: `Return one strict valid JSON object only; do not use Markdown or code fences. Create original, factual AI-assisted news content from the attributed source. Use genuinely fresh wording: do not copy a sentence, paragraph, or any sequence of eight source words. Do not add facts, guesses, opinions, or keyword stuffing.

      Required JSON: {"rewrittenTitle":"max 110 chars","summary":"10 clear factual sentences, one per line","keyPoints":["10 factual takeaways"],"keyFacts":["10 concrete source-supported facts"],"whyThisMatters":"10 clear sentences, one per line, on impact/background/what to watch","sentiment":"positive|neutral|negative|mixed","keywords":["5-10 natural keyword phrases"],"seoTitle":"original max 110 chars","metaDescription":"original factual max 160 chars"}. Return exactly 10 lines in summary, 10 items in keyPoints, and 10 items in keyFacts.

Source title: ${title}
Source description: ${description}
Source content: ${content}`,
      }],
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:5173",
        "X-Title": "NewsStore24",
      },
      timeout: Number(process.env.OPENROUTER_TIMEOUT_MS || 20000),
    });

    const raw = response.data.choices?.[0]?.message?.content || "";
    const parsed = parseJsonObject(raw) || {};
    const fallback = createArticleEnrichmentFallback({ title, description, content });
    const aiSummary = ensureMinimumSummary(parsed.summary || parsed.aiSummary, fallback.aiSummary);
    const whyThisMatters = normalizeText(parsed.whyThisMatters || parsed.whyItMatters, 320) || fallback.whyThisMatters;
    return {
      rewrittenTitle: normalizeText(parsed.rewrittenTitle, 110) || fallback.rewrittenTitle,
      aiSummary,
      summary: aiSummary,
      keyPoints: ensureMinimumList(parsed.keyPoints, fallback.keyPoints),
      keyFacts: ensureMinimumList(parsed.keyFacts, fallback.keyFacts),
      whyThisMatters: ensureMinimumWhy(whyThisMatters, fallback.whyThisMatters),
      whyItMatters: ensureMinimumWhy(whyThisMatters, fallback.whyThisMatters),
      sentiment: String(parsed.sentiment || "").toLowerCase(),
      keywords: normalizeList(parsed.keywords, 10),
      seoTitle: normalizeText(parsed.seoTitle, 110) || fallback.seoTitle,
      metaDescription: normalizeText(parsed.metaDescription, 160) || fallback.metaDescription,
    };
  } catch (error) {
    console.log("OPENROUTER ARTICLE ERROR:", error.response?.data?.error?.message || error.message);
    throw new Error("OpenRouter enrichment response was invalid");
  }
};

const createFallbackChatAnswer = ({ title, content, question }) => {
  const details = String(content || "").replace(/\s+/g, " ").trim();
  const shortDetails = details.length > 500 ? `${details.slice(0, 497)}...` : details;
  const asksInHindi = /[\u0900-\u097F]|\b(kya|kyu|kaise|samjhao|hai|hua|isme)\b/i.test(question);

  if (asksInHindi) {
    return `इस खबर में ${title}. उपलब्ध जानकारी: ${shortDetails || "अभी article की detail उपलब्ध नहीं है।"} ज्यादा context के लिए original news link खोलें।`;
  }

  return `This article is about ${title}. Available details: ${shortDetails || "The article does not include enough detail to answer that question."} Please open the original news link for full context.`;
};

export const answerNewsQuestion = async ({ title, content, question }) => {
  if (!process.env.OPENROUTER_API_KEY) return createFallbackChatAnswer({ title, content, question });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
        max_tokens: 280,
        temperature: 0.3,
        messages: [{
          role: "user",
          content: `Answer the question only from the news context below. If the answer is not in the context, say so clearly.\n\nNews title: ${title}\nNews content: ${content}\n\nQuestion: ${question}`,
        }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": appUrl,
          "X-Title": "NewsStore24",
        },
        timeout: 20000,
      }
    );

    return response.data.choices?.[0]?.message?.content || createFallbackChatAnswer({ title, content, question });
  } catch (error) {
    console.error("OPENROUTER CHAT ERROR:", error.response?.data?.error?.message || error.message);
    return createFallbackChatAnswer({ title, content, question });
  }
};
