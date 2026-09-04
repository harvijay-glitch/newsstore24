import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "NewsStore24";
const DEFAULT_DESCRIPTION = "Get the latest breaking news, trending stories and AI-powered summaries across business, technology, sports, world news and more from NewsStore24.";
const DEFAULT_KEYWORDS = "latest news, breaking news, AI news summaries, business news, technology news, sports news, world news";
const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");

const pageMetadata = {
  "/": { title: "NewsStore24 | Latest Breaking News & AI Summaries", description: DEFAULT_DESCRIPTION, keywords: DEFAULT_KEYWORDS },
  "/world": { title: "World News | NewsStore24", description: "Latest world news, global developments and international headlines.", keywords: "world news, international news, global news, latest world updates" },
  "/business": { title: "Business News | NewsStore24", description: "Latest business news, company updates, markets and the economy.", keywords: "business news, market news, economy news, company updates" },
  "/crypto": { title: "Crypto News | NewsStore24", description: "Latest cryptocurrency, blockchain and digital asset news.", keywords: "crypto news, cryptocurrency news, blockchain news, digital assets" },
  "/stock": { title: "Stock Market News | NewsStore24", description: "Latest stock market news, market movements and investor updates.", keywords: "stock market news, share market news, investing news, market updates" },
  "/technology": { title: "Technology News | NewsStore24", description: "Latest technology news, AI updates, products and digital trends.", keywords: "technology news, AI news, tech updates, digital trends" },
  "/sports": { title: "Sports News | NewsStore24", description: "Latest sports news, match updates and major sporting stories.", keywords: "sports news, match updates, cricket news, football news" },
  "/blog": { title: "Blog | NewsStore24", description: "NewsStore24 analysis, explainers and editorial stories.", keywords: "NewsStore24 blog, news analysis, news explainers" },
  "/daily-brief": { title: "Daily News Brief | NewsStore24", description: "A quick, AI-powered daily brief of the news that matters.", keywords: "daily news brief, AI news summary, latest headlines, news updates" },
  "/saved": { title: "Saved News | NewsStore24", description: "Your saved stories from NewsStore24.", keywords: DEFAULT_KEYWORDS, noIndex: true },
  "/search": { title: "Search News | NewsStore24", description: "Search NewsStore24.", keywords: DEFAULT_KEYWORDS, noIndex: true },
  "/admin": { title: "Admin Dashboard | NewsStore24", description: "NewsStore24 administration dashboard.", keywords: DEFAULT_KEYWORDS, noIndex: true },
  "/about": { title: "About NewsStore24", description: "Learn how NewsStore24 helps readers catch up with important stories quickly.", keywords: "about NewsStore24, latest news, breaking news, AI news summaries" },
  "/contact": { title: "Contact NewsStore24", description: "Get in touch with the NewsStore24 team.", keywords: "contact NewsStore24, news corrections, editorial feedback" },
  "/privacy": { title: "Privacy Policy | NewsStore24", description: "Read the NewsStore24 privacy policy.", keywords: "NewsStore24 privacy policy" },
  "/terms": { title: "Terms of Use | NewsStore24", description: "Read the NewsStore24 terms of use.", keywords: "NewsStore24 terms of use" },
};

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const [name, content] = attribute.split("=");
    element.setAttribute(name, content.replaceAll('"', ""));
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function SEO({ article }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const isAdminPage = pathname.startsWith("/admin");
    const isPrivatePage = pathname === "/saved" || pathname === "/search";
    const metadata = article
      ? { title: article.seoTitle || article.title, description: article.metaDescription || article.description || DEFAULT_DESCRIPTION, keywords: article.keywords || DEFAULT_KEYWORDS }
      : { ...(pageMetadata[pathname] || { title: `${SITE_NAME} | Latest News`, description: DEFAULT_DESCRIPTION, keywords: DEFAULT_KEYWORDS }), noIndex: isAdminPage || isPrivatePage };
    const origin = configuredSiteUrl || window.location.origin;
    const canonicalUrl = `${origin}${pathname}`;
    const storedImage = article?.generatedImageUrl || article?.image || "/favicon.ico";
    const imageUrl = storedImage.startsWith("/") ? `${origin}${storedImage}` : storedImage;

    document.title = metadata.title;
    document.documentElement.lang = "en";
    setMeta('meta[name="description"]', 'name="description"', metadata.description);
    setMeta('meta[name="keywords"]', 'name="keywords"', metadata.keywords);
    setMeta('meta[property="og:title"]', 'property="og:title"', metadata.title);
    setMeta('meta[property="og:description"]', 'property="og:description"', metadata.description);
    setMeta('meta[property="og:url"]', 'property="og:url"', canonicalUrl);
    setMeta('meta[property="og:type"]', 'property="og:type"', article ? "article" : "website");
    setMeta('meta[property="og:site_name"]', 'property="og:site_name"', SITE_NAME);
    setMeta('meta[property="og:image"]', 'property="og:image"', imageUrl);
    setMeta('meta[property="og:image:alt"]', 'property="og:image:alt"', article ? `${article.seoTitle || article.title} — ${article.source || SITE_NAME}` : SITE_NAME);
    setMeta('meta[name="twitter:title"]', 'name="twitter:title"', metadata.title);
    setMeta('meta[name="twitter:description"]', 'name="twitter:description"', metadata.description);
    setMeta('meta[name="twitter:card"]', 'name="twitter:card"', "summary_large_image");
    setMeta('meta[name="twitter:image"]', 'name="twitter:image"', imageUrl);
    setMeta('meta[name="twitter:image:alt"]', 'name="twitter:image:alt"', article ? `${article.seoTitle || article.title} — ${article.source || SITE_NAME}` : SITE_NAME);
    if (article) {
      setMeta('meta[name="author"]', 'name="author"', article.authorName || article.author || article.source || SITE_NAME);
      setMeta('meta[property="article:published_time"]', 'property="article:published_time"', article.publishedAt || "");
      setMeta('meta[property="article:modified_time"]', 'property="article:modified_time"', article.updatedAt || article.publishedAt || "");
      setMeta('meta[property="article:section"]', 'property="article:section"', article.category || "General");
    }
    setMeta('meta[name="robots"]', 'name="robots"', metadata.noIndex ? "noindex, nofollow" : "index, follow");

    const verificationToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
    if (verificationToken && !verificationToken.startsWith("your_")) {
      setMeta('meta[name="google-site-verification"]', 'name="google-site-verification"', verificationToken);
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    let structuredData = document.head.querySelector('script[data-newsstore24-schema="page"]');
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.setAttribute("type", "application/ld+json");
      structuredData.setAttribute("data-newsstore24-schema", "page");
      document.head.appendChild(structuredData);
    }
    const schema = article ? {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NewsArticle",
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          headline: article.seoTitle || article.title,
          description: metadata.description,
          image: article.generatedImageUrl || article.image ? [imageUrl] : undefined,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt || article.publishedAt,
          author: { "@type": "Person", name: article.authorName || article.author || article.source || SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
          isBasedOn: article.url,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: origin },
            { "@type": "ListItem", position: 2, name: article.category || "News", item: `${origin}/${String(article.category || "").toLowerCase()}` },
            { "@type": "ListItem", position: 3, name: article.seoTitle || article.title, item: canonicalUrl },
          ],
        },
      ],
    } : {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: origin,
    };
    structuredData.textContent = JSON.stringify(schema);
  }, [pathname, article]);

  return null;
}

export default SEO;
