import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsAIEnrichment } from "../../services/aiService";
import { getRecommendations } from "../../services/newsService";
import NewsChatModal from "../NewsChatModal";
import { formatArticleDate } from "../../utils/articleDate";
import { optimizeImage } from "../../utils/optimizeImage";
import AIImportanceScore from "../AIImportanceScore";
import FactCheckBadge from "../FactCheckBadge";
import TrendingBadge from "../TrendingBadge";

function LatestNews({ news, loading, filterLabel }) {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryTitle, setSummaryTitle] = useState("");
  const [chatArticle, setChatArticle] = useState(null);
  const [fallbackNews, setFallbackNews] = useState([]);

  useEffect(() => {
    const missingCards = (3 - ((news || []).length % 3)) % 3;

    if (missingCards === 0) {
      setFallbackNews([]);
      return;
    }

    let active = true;
    getRecommendations()
      .then((articles) => {
        const existingIds = new Set((news || []).map((item) => item._id || item.id));
        const distinctArticles = (articles || []).filter((item) => !existingIds.has(item._id || item.id));
        if (active) setFallbackNews(distinctArticles.slice(0, missingCards));
      })
      .catch(() => {
        if (active) setFallbackNews([]);
      });

    return () => { active = false; };
  }, [news]);

  const displayedNews = useMemo(() => {
    const primaryNews = news || [];
    const existingIds = new Set(primaryNews.map((item) => item._id || item.id));
    const additionalNews = fallbackNews.filter((item) => !existingIds.has(item._id || item.id));
    return [...primaryNews, ...additionalNews];
  }, [news, fallbackNews]);

  const handleSummary = async (item) => {
    const id = item._id || item.id;
    setSummaryTitle(item.title);
    setSummary(null);
    setLoadingSummary(true);

    try {
      // Existing background summaries appear instantly; new ones are cached by the server.
      const fallbackLines = [item.description || "Additional context is not available yet.", "Check the original source for further details.", "The story may receive later updates.", "Verify important facts against the source report.", "The report provides available context for readers.", "Important claims should be verified with the source.", "The publisher may add follow-up information.", "The article reflects the details currently available.", "Readers should check names, dates, and figures.", "The original source remains the primary reference."];
      const summaryLines = [item.aiSummary || "Summary is not available yet.", "Additional article context should be verified from the original source.", "The original report should be checked for later updates.", "Important details should be confirmed with the publisher.", "Readers should review the complete source article.", "Further reporting may add useful context.", "The available summary reflects the current article details.", "Source attribution should be considered when reading this summary.", "Any developing information may change as updates arrive.", "The original source remains the primary reference."];
      const result = item.aiSummary
        ? { summary: summaryLines.slice(0, 10).join("\n"), keyPoints: [...(item.keyPoints || []), ...fallbackLines].slice(0, 10), keyFacts: [...(item.keyFacts || []), ...fallbackLines].slice(0, 10), whyThisMatters: item.whyThisMatters || item.whyItMatters || fallbackLines.join("\n") }
        : (id && await getNewsAIEnrichment(id));
      setSummary(result || { summary: "Summary is not available for this article.", keyPoints: [], keyFacts: [], whyThisMatters: "" });
    } catch (error) {
      console.error("AI Summary Error:", error);
      setSummary("Unable to generate AI summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const closeSummary = () => {
    setSummary(null);
    setSummaryTitle("");
  };

  if (loading) return <div className="text-center py-10">Loading Latest News...</div>;
  if (displayedNews.length === 0) return <div className="text-center py-10">No {filterLabel || "Latest"} News</div>;

  return (
    <>
      <section id="latest-news" className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-4xl font-bold mb-8">{filterLabel ? `${filterLabel} News` : "Latest News"}</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((item) => (
            <article key={item._id || item.id} className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-2xl">
              <img src={optimizeImage(item.image, { width: 640 })} alt={item.title} width="640" height="360" loading="lazy" decoding="async" className="aspect-video h-auto w-full object-cover" />
              <div className="p-5">
                <p className="text-sm font-semibold text-red-600">{item.source?.name || item.source}</p>
                <h3 className="mt-3 text-xl font-bold line-clamp-2">{item.title}</h3>
                <p className="mt-2 text-xs font-bold text-slate-700">By NewsStore24 Editorial Desk</p>
                <p className="mt-3 text-gray-600 line-clamp-3">{item.description}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">{formatArticleDate(item.publishedAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={item.aiImportance} factors={item.aiScoreFactors} /><FactCheckBadge status={item.factCheckStatus} reason={item.factCheckReason} /><TrendingBadge badge={item.trendingBadge} reason={item.trendingBadgeReason} /></div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/article/${item.slug || item._id || item.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Read &amp; AI Summary</Link>
                  <button onClick={() => setChatArticle(item)} className="rounded-lg border border-violet-600 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">Ask AI</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {(loadingSummary || summary) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-2">AI Summary</h2>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{summaryTitle}</p>
            {loadingSummary ? <p>Generating complete AI brief...</p> : (
              <div className="space-y-5 text-gray-700">
                <div><h3 className="font-bold">AI Summary</h3><p className="mt-1 whitespace-pre-wrap">{summary.summary}</p></div>
                <div><h3 className="font-bold">Key Points</h3><ul className="mt-1 list-disc pl-5">{(summary.keyPoints || []).map((point) => <li key={point}>{point}</li>)}</ul></div>
                <div><h3 className="font-bold">Key Facts</h3><ul className="mt-1 list-disc pl-5">{(summary.keyFacts || []).map((fact) => <li key={fact}>{fact}</li>)}</ul></div>
                <div><h3 className="font-bold">Why This Matters</h3><p className="mt-1 whitespace-pre-line">{summary.whyThisMatters || summary.whyItMatters}</p></div>
              </div>
            )}
            <button onClick={closeSummary} className="mt-6 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700">Close</button>
          </div>
        </div>
      )}
      {chatArticle && <NewsChatModal article={chatArticle} onClose={() => setChatArticle(null)} />}
    </>
  );
}

export default LatestNews;
