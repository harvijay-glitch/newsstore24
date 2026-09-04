import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const dist = resolve(root, "dist");
const siteUrl = (process.env.VITE_SITE_URL || "https://www.newsstore24.com").replace(/\/$/, "");
const apiUrl = (process.env.VITE_API_URL || "https://newsstore24-1.onrender.com/api").replace(/\/$/, "");
const defaultDescription =
  "Get the latest breaking news, trending stories and AI-powered summaries across business, technology, sports, world news and more from NewsStore24.";
const defaultKeywords =
  "latest news, breaking news, AI news summaries, business news, technology news, sports news, world news";

const pages = {
  "/": ["NewsStore24 | Latest Breaking News & AI Summaries", defaultDescription, defaultKeywords],
  "/world": ["World News | NewsStore24", "Latest world news, global developments and international headlines.", "world news, international news, global news, latest world updates"],
  "/business": ["Business News | NewsStore24", "Latest business news, company updates, markets and the economy.", "business news, market news, economy news, company updates"],
  "/crypto": ["Crypto News | NewsStore24", "Latest cryptocurrency, blockchain and digital asset news.", "crypto news, cryptocurrency news, blockchain news, digital assets"],
  "/stock": ["Stock Market News | NewsStore24", "Latest stock market news, market movements and investor updates.", "stock market news, share market news, investing news, market updates"],
  "/technology": ["Technology News | NewsStore24", "Latest technology news, AI updates, products and digital trends.", "technology news, AI news, tech updates, digital trends"],
  "/sports": ["Sports News | NewsStore24", "Latest sports news, match updates and major sporting stories.", "sports news, match updates, cricket news, football news"],
  "/blog": ["Blog | NewsStore24", "NewsStore24 analysis, explainers and editorial stories.", "NewsStore24 blog, news analysis, news explainers"],
  "/daily-brief": ["Daily News Brief | NewsStore24", "A quick, AI-powered daily brief of the news that matters.", "daily news brief, AI news summary, latest headlines, news updates"],
  "/about": ["About NewsStore24", "Learn how NewsStore24 helps readers catch up with important stories quickly.", "about NewsStore24, latest news, breaking news, AI news summaries"],
  "/contact": ["Contact NewsStore24", "Get in touch with the NewsStore24 team.", "contact NewsStore24, news corrections, editorial feedback"],
  "/privacy": ["Privacy Policy | NewsStore24", "Read the NewsStore24 privacy policy.", "NewsStore24 privacy policy"],
  "/terms": ["Terms of Use | NewsStore24", "Read the NewsStore24 terms of use.", "NewsStore24 terms of use"],
};

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const replaceMeta = (html, selector, content) => {
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(")`, "i");
  return html.replace(pattern, `$1${escapeAttribute(content)}$2`);
};

const escapeJsonForHtml = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

const writePage = async (pathname, title, description, keywords, imageUrl = "", structuredData = null) => {
  const canonicalUrl = `${siteUrl}${pathname}`;
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
  html = replaceMeta(html, 'name="description"', description);
  html = replaceMeta(html, 'name="keywords"', keywords);
  html = replaceMeta(html, 'property="og:type"', "website");
  html = replaceMeta(html, 'property="og:title"', title);
  html = replaceMeta(html, 'property="og:description"', description);
  html = html.replace(
    "</head>",
    `    <meta property="og:title" content="${escapeAttribute(title)}" />\n` +
      `    <meta property="og:description" content="${escapeAttribute(description)}" />\n` +
      `    <meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />\n` +
      (imageUrl ? `    <meta property="og:image" content="${escapeAttribute(imageUrl)}" />\n` : "") +
      `    <meta name="twitter:title" content="${escapeAttribute(title)}" />\n` +
      `    <meta name="twitter:description" content="${escapeAttribute(description)}" />\n` +
      `    <link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />\n` +
      (structuredData ? `    <script type="application/ld+json">${escapeJsonForHtml(structuredData)}</script>\n` : "") +
      "  </head>",
  );
  const outputDirectory = resolve(dist, pathname.slice(1));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(resolve(outputDirectory, "index.html"), html);
};

const template = await readFile(resolve(dist, "index.html"), "utf8");
for (const [pathname, [title, description, keywords]] of Object.entries(pages)) {
  await writePage(pathname, title, description, keywords);
}

const sitemapResponse = await fetch(`${apiUrl}/news/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`Article sitemap request failed with ${sitemapResponse.status}.`);
const sitemap = await sitemapResponse.text();
const articlePaths = [...sitemap.matchAll(/<loc>[^<]*\/article\/([^<]+)<\/loc>/g)]
  .map((match) => `/article/${match[1]}`)
  .filter((pathname, index, paths) => paths.indexOf(pathname) === index);

let articleCount = 0;
for (let index = 0; index < articlePaths.length; index += 10) {
  const batch = articlePaths.slice(index, index + 10);
  const results = await Promise.all(batch.map(async (pathname) => {
    const slug = pathname.slice("/article/".length);
    const response = await fetch(`${apiUrl}/news/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      console.warn(`Skipping ${pathname}: article request failed with ${response.status}.`);
      return false;
    }
    const payload = await response.json();
    const article = payload.article;
    if (!article?.title) {
      console.warn(`Skipping ${pathname}: article payload has no title.`);
      return false;
    }
    const title = article.seoTitle || article.title;
    const description = article.metaDescription || article.description || defaultDescription;
    const keywords = article.keywords || defaultKeywords;
    const imageUrl = article.generatedImageUrl || article.image || "";
    await writePage(pathname, title, description, keywords, imageUrl, {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}${pathname}` },
      headline: title,
      description,
      image: imageUrl ? [imageUrl] : undefined,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: { "@type": "Person", name: article.authorName || article.author || article.source || "NewsStore24" },
      publisher: { "@type": "Organization", name: "NewsStore24" },
      isBasedOn: article.url,
    });
    return true;
  }));
  articleCount += results.filter(Boolean).length;
}

console.log(`Generated crawlable HTML shells for ${Object.keys(pages).length} public routes and ${articleCount} articles.`);
