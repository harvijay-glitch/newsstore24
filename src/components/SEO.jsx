import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "AI News";
const DEFAULT_DESCRIPTION = "Latest breaking news, trending stories, AI summaries, business, technology, sports and world updates from AI News.";

const pageMetadata = {
  "/": { title: "AI News | Latest Breaking News & AI Summaries", description: DEFAULT_DESCRIPTION },
  "/world": { title: "World News | AI News", description: "Latest world news, global developments and international headlines." },
  "/business": { title: "Business News | AI News", description: "Latest business news, company updates, markets and the economy." },
  "/crypto": { title: "Crypto News | AI News", description: "Latest cryptocurrency, blockchain and digital asset news." },
  "/stock": { title: "Stock Market News | AI News", description: "Latest stock market news, market movements and investor updates." },
  "/technology": { title: "Technology News | AI News", description: "Latest technology news, AI updates, products and digital trends." },
  "/sports": { title: "Sports News | AI News", description: "Latest sports news, match updates and major sporting stories." },
  "/daily-brief": { title: "Daily News Brief | AI News", description: "A quick, AI-powered daily brief of the news that matters." },
  "/saved": { title: "Saved News | AI News", description: "Your saved stories from AI News.", noIndex: true },
  "/admin": { title: "Admin Dashboard | AI News", description: "AI News administration dashboard.", noIndex: true },
  "/about": { title: "About AI News", description: "Learn how AI News helps readers catch up with important stories quickly." },
  "/contact": { title: "Contact AI News", description: "Get in touch with the AI News team." },
  "/privacy": { title: "Privacy Policy | AI News", description: "Read the AI News privacy policy." },
  "/terms": { title: "Terms of Use | AI News", description: "Read the AI News terms of use." },
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
    const metadata = article
      ? { title: article.seoTitle || article.title, description: article.metaDescription || article.description || DEFAULT_DESCRIPTION }
      : (pageMetadata[pathname] || { title: `${SITE_NAME} | Latest News`, description: DEFAULT_DESCRIPTION });
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${pathname}`;
    const storedImage = article?.generatedImageUrl || article?.image || "/favicon.ico";
    const imageUrl = storedImage.startsWith("/") ? `${origin}${storedImage}` : storedImage;

    document.title = metadata.title;
    document.documentElement.lang = "en";
    setMeta('meta[name="description"]', 'name="description"', metadata.description);
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

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    let structuredData = document.head.querySelector('script[data-ai-news-schema="page"]');
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.setAttribute("type", "application/ld+json");
      structuredData.setAttribute("data-ai-news-schema", "page");
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
