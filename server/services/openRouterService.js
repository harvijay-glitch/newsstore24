import axios from "axios";

export const normalizeFiveBulletPoints = (summary = "") => {
  const points = summary
    .split("\n")
    .map((line) => line.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, ""))
    .filter(Boolean);

  return points.length === 5 ? points.map((point) => `- ${point}`).join("\n") : null;
};

export const createFallbackSummary = (text = "") => {
  const title = text.match(/Title:\s*([^\n]+?)(?=\s*Description:|$)/i)?.[1]?.trim() || "this news story";
  const description = text.match(/Description:\s*([^\n]+?)(?=\s*Content:|$)/i)?.[1]?.trim()
    || text.replace(/\s+/g, " ").trim();
  const detail = description.length > 180 ? `${description.slice(0, 177)}...` : description;

  return [
    `- This story focuses on ${title}.`,
    `- Available report details: ${detail || "The article details are limited."}`,
    "- The full AI service is temporarily unavailable, so this is a basic article summary.",
    "- Review the original article for complete context, sources, and any later updates.",
    "- Detailed AI summaries will become available again when the AI provider is restored.",
  ].join("\n");
};

const appUrl = process.env.APP_URL || "https://newsstore24.com";

export const generateSummary = async (text) => {
  const requestSummary = async () => {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
        max_tokens: 220,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: `Write exactly five factual news-summary bullet points. Each line must start with "- ". Keep every point short (12 to 20 words). Cover what happened, who is involved, key facts, impact, and what happens next. Return only five lines; no title, introduction, or conclusion.

${text}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": appUrl,
          "X-Title": "NewsStore24",
        },
        timeout: 12000,
      }
    );

    return response.data.choices?.[0]?.message?.content || "";
  };

  // Do not cache an incomplete response. One retry handles occasional
  // provider formatting misses without leaving the UI waiting indefinitely.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const summary = await requestSummary();
      const normalizedSummary = normalizeFiveBulletPoints(summary);
      if (normalizedSummary) return normalizedSummary;
    } catch (error) {
      console.log("OPENROUTER SUMMARY ERROR:", error.response?.data?.error?.message || error.message);
      break;
    }
  }

  return createFallbackSummary(text);
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

Required JSON: {"rewrittenTitle":"max 110 chars","aiSummary":"80-120 words","keyPoints":["4-6 factual takeaways"],"keyFacts":["3-6 concrete source-supported facts"],"whyItMatters":"one or two sentences on impact/background/what to watch","sentiment":"positive|neutral|negative|mixed","keywords":["5-10 natural keyword phrases"],"seoTitle":"original max 110 chars","metaDescription":"original factual max 160 chars"}. If the source cannot support every field, return {}.

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
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "").trim());
    return {
      rewrittenTitle: String(parsed.rewrittenTitle || "").trim().slice(0, 110),
      aiSummary: String(parsed.aiSummary || "").replace(/\s+/g, " ").trim(),
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String).map((point) => point.trim()).filter(Boolean).slice(0, 6) : [],
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts.map(String).map((fact) => fact.trim()).filter(Boolean).slice(0, 6) : [],
      whyItMatters: String(parsed.whyItMatters || "").trim().slice(0, 320),
      sentiment: String(parsed.sentiment || "").toLowerCase(),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).map((keyword) => keyword.trim()).filter(Boolean).slice(0, 10) : [],
      seoTitle: String(parsed.seoTitle || "").trim().slice(0, 110),
      metaDescription: String(parsed.metaDescription || "").trim().slice(0, 160),
    };
  } catch (error) {
    console.log("OPENROUTER ARTICLE ERROR:", error.response?.data?.error?.message || error.message);
    throw new Error("OpenRouter enrichment response was invalid");
  }
};

export const hasFiveBulletPoints = (summary = "") => summary
  .split("\n")
  .filter((line) => /^\s*(?:-|•|\d+[.)])\s+/.test(line))
  .length === 5;

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
