import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { getNewsArticle, getRelatedNews } from "../services/newsService";
import { getNewsAIEnrichment } from "../services/aiService";
import { translateTexts } from "../services/translationService";
import { formatArticleDate } from "../utils/articleDate";

function Article({ language = "en" }) {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [error, setError] = useState("");
  const [translatedContent, setTranslatedContent] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [relatedSummary, setRelatedSummary] = useState(null);
  const [relatedSummaryTitle, setRelatedSummaryTitle] = useState("");
  const [loadingRelatedSummary, setLoadingRelatedSummary] = useState(false);

  useEffect(() => {
    let active = true;
    setArticle(null);
    setRelatedNews([]);
    getNewsArticle(id)
      .then((nextArticle) => { if (active) setArticle(nextArticle); })
      .catch(() => { if (active) setError("This news article could not be loaded."); });
    getRelatedNews(id)
      .then((nextRelatedNews) => { if (active) setRelatedNews(nextRelatedNews); })
      .catch(() => { if (active) setRelatedNews([]); });
    return () => { active = false; };
  }, [id]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    localStorage.setItem(`newsstore24-liked-${id}`, String(next));
  };

  const toggleSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://newsstore24-1.onrender.com/api"}/news/bookmark/${article._id}`, { method: "PATCH" });
      if (response.ok) setBookmarked((current) => { const next = !current; localStorage.setItem(`newsstore24-bookmarked-${id}`, String(next)); return next; });
    } catch { setBookmarked((current) => !current); }
  };

  const shareArticle = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: displayTitle, text: displayExcerpt, url });
    else await navigator.clipboard.writeText(url);
  };

  const submitComment = (event) => {
    event.preventDefault();
    const value = comment.trim();
    if (!value) return;
    const next = [...comments, { text: value, createdAt: new Date().toISOString() }];
    setComments(next);
    localStorage.setItem(`newsstore24-comments-${id}`, JSON.stringify(next));
    setComment("");
  };

  useEffect(() => {
    if (!article || language === "en") {
      setTranslatedContent(null);
      return;
    }

    let active = true;
    const translateArticle = async () => {
      const fields = [
        article.originalTitle || article.title || "",
        article.originalDescription || article.description || "",
        article.aiSummary || article.description || "",
        article.whyThisMatters || article.whyItMatters || "",
        ...(article.keyPoints || []),
        ...(article.keyFacts || []),
      ];
      try {
        const translated = await translateTexts(fields, language);
        if (!active) return;
        const keyPointCount = (article.keyPoints || []).length;
        setTranslatedContent({
          title: translated[0] || fields[0],
          description: translated[1] || fields[1],
          summary: translated[2] || fields[2],
          whyItMatters: translated[3] || fields[3],
          keyPoints: translated.slice(4, 4 + keyPointCount),
          keyFacts: translated.slice(4 + keyPointCount),
        });
      } catch {
        if (active) setTranslatedContent(null);
      }
    };
    translateArticle();
    return () => { active = false; };
  }, [article, language]);

  if (error) return <p className="mx-auto max-w-3xl px-6 py-20 text-center text-slate-600">{error}</p>;
  if (!article) return <p className="mx-auto max-w-3xl px-6 py-20 text-center text-slate-600">Loading article...</p>;

  const title = article.seoTitle || article.title;
  const visibleTitle = article.originalTitle || article.title || title;
  const sourceExcerpt = article.originalDescription || "";
  const author = article.authorName || article.author || article.source || "NewsStore24 Editorial Desk";
  const articleDetail = article.description || "Details are not available for this article yet.";
  const minimumLines = [articleDetail, "Additional details should be checked against the original source.", "The story may receive further updates.", "The report provides available context for readers.", "Important claims should be verified with the source.", "The publisher may add follow-up information.", "The article reflects the details currently available.", "Readers should check names, dates, and figures.", "Further reporting may clarify unresolved details.", "The original source remains the primary reference."];
  const keyPoints = [...(article.keyPoints || []), ...minimumLines].filter((item, index, items) => items.indexOf(item) === index).slice(0, 10);
  const keyFacts = [...(article.keyFacts || []), ...minimumLines].filter((item, index, items) => items.indexOf(item) === index).slice(0, 10);
  const displayTitle = translatedContent?.title || visibleTitle;
  const displayExcerpt = translatedContent?.description || sourceExcerpt;
  const summaryText = translatedContent?.summary || article.aiSummary || article.description || "Article summary is not available yet.";
  const displaySummary = [...String(summaryText).split(/(?<=[.!?])\s+/).filter(Boolean), "Additional article context should be verified from the original source.", "The original report should be checked for later updates.", "Important details should be confirmed with the publisher.", "Readers should review the complete source article.", "Further reporting may add useful context.", "The available summary reflects the current article details.", "Source attribution should be considered when reading this summary.", "Any developing information may change as updates arrive.", "The original source remains the primary reference."]
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 10)
    .join("\n");
  const displayKeyPoints = translatedContent?.keyPoints?.length ? translatedContent.keyPoints : keyPoints;
  const displayKeyFacts = translatedContent?.keyFacts?.length ? translatedContent.keyFacts : keyFacts;
  const whyText = translatedContent?.whyItMatters || article.whyThisMatters || article.whyItMatters || "Review the original source for the latest context and updates.";
  const displayWhyItMatters = [...String(whyText).split(/(?<=[.!?])\s+/).filter(Boolean), "The story may develop as more information becomes available.", "Its wider impact depends on verified details and responses.", "Check the original source for follow-up reporting.", "The report provides available context for readers.", "Important claims should be verified with the source.", "The publisher may add follow-up information.", "The article reflects the details currently available.", "Readers should check names, dates, and figures.", "The original source remains the primary reference."]
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 10)
    .join("\n");

  const showRelatedSummary = async (item) => {
    setRelatedSummaryTitle(item.seoTitle || item.title || "Related news");
    setRelatedSummary(null);
    setLoadingRelatedSummary(true);
    try {
      const result = await getNewsAIEnrichment(item._id);
      setRelatedSummary(result);
    } catch (summaryError) {
      console.error("Related AI summary failed:", summaryError);
      setRelatedSummary({ summary: item.description || "Summary is not available yet.", keyPoints: [], keyFacts: [], whyThisMatters: "Review the original source for more context." });
    } finally {
      setLoadingRelatedSummary(false);
    }
  };

  return (
    <>
      <SEO article={article} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm font-medium text-slate-600">
          <Link to="/" className="text-blue-700 hover:underline">Home</Link><span className="mx-2">/</span>
          <Link to={`/${String(article.category || "general").toLowerCase()}`} className="text-blue-700 hover:underline">{article.category || "News"}</Link><span className="mx-2">/</span>
          <span className="text-slate-500">Article</span>
        </nav>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-red-600">{article.category || "News"} · Reported by {article.source || "Original source"}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl md:text-5xl">{displayTitle}</h1>
        {displayExcerpt && <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{displayExcerpt}</p>}

        <div className="mt-6 grid gap-2 border-y border-slate-200 py-4 text-sm text-slate-600 sm:grid-cols-2 sm:gap-x-8">
          <p><span className="font-bold text-slate-900">By </span><Link to={`/author/${encodeURIComponent(author)}`} className="text-blue-600 hover:underline">{author}</Link></p>
          <p className="mt-1"><span className="font-bold text-slate-900">Reading time: </span>{article.readingTime || 1} min read</p>
          <p className="mt-1"><span className="font-bold text-slate-900">Published: </span>{formatArticleDate(article.publishedAt)}</p>
          <p className="mt-1"><span className="font-bold text-slate-900">Updated: </span>{formatArticleDate(article.updatedAt || article.publishedAt)}</p>
        </div>

        <section className="mt-8 border-l-4 border-red-600 pl-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">AI-assisted newsroom brief</p>
          <h2 className="text-2xl font-black">AI Summary</h2>
          <p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg">{displaySummary}</p>
        </section>

        <section className="mt-8 rounded-2xl bg-slate-50 p-6">
          <h2 className="text-2xl font-black">Key Points</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{displayKeyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
        </section>

        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="text-2xl font-black text-sky-950">Key Facts</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sky-950">{displayKeyFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </section>

        <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-6">
          <h2 className="text-2xl font-black text-violet-950">Why This Matters</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-violet-950">{displayWhyItMatters}</p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Original Source</h2>
          <p className="mt-2 text-slate-700">Reported by {article.source || "the original publisher"}. The AI Summary and analysis above are original AI-assisted editorial content, not a copy of the source report.</p>
          {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Read original article <span aria-hidden="true">↗</span></a>}
        </section>
        <p className="mt-8 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">Editorial disclosure: NewsStore24 generates original AI-assisted summaries, key facts, and context from attributed news sources. It does not claim to be the original reporter.</p>

        <section className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-black">Related News</h2>
          {relatedNews.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{relatedNews.map((item) => (
            <article key={item._id} className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-400 hover:shadow-sm">
              <p className="text-xs font-bold text-red-600">{item.source}</p>
              <h3 className="mt-1 font-bold line-clamp-2">{item.seoTitle || item.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/article/${item.slug || item._id}`} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Read</Link>
                <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); showRelatedSummary(item); }} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">AI Summary</button>
              </div>
            </article>
          ))}</div> : <p className="mt-4 text-slate-500">No related stories are available yet.</p>}
        </section>
      </article>
      {(loadingRelatedSummary || relatedSummary) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black">AI Summary</h2>
            <p className="mt-1 text-sm text-slate-500">{relatedSummaryTitle}</p>
            {loadingRelatedSummary ? <p className="mt-6">Loading AI summary...</p> : (
              <div className="mt-6 space-y-5">
                <section><h3 className="font-black">AI Summary</h3><p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{relatedSummary.summary || relatedSummary.aiSummary}</p></section>
                <section><h3 className="font-black">Key Points</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">{(relatedSummary.keyPoints || []).map((point) => <li key={point}>{point}</li>)}</ul></section>
                <section><h3 className="font-black">Key Facts</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">{(relatedSummary.keyFacts || []).map((fact) => <li key={fact}>{fact}</li>)}</ul></section>
                <section><h3 className="font-black">Why This Matters</h3><p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{relatedSummary.whyThisMatters || relatedSummary.whyItMatters}</p></section>
              </div>
            )}
            <button type="button" onClick={() => setRelatedSummary(null)} className="mt-6 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Article;
