import { useState } from "react";
import { Link } from "react-router-dom";
import { getNewsAISummary } from "../../services/aiService";
import NewsChatModal from "../NewsChatModal";
import { formatArticleDate } from "../../utils/articleDate";
import AIImportanceScore from "../AIImportanceScore";
import FactCheckBadge from "../FactCheckBadge";
import TrendingBadge from "../TrendingBadge";

function TrendingNews({ news, loading, filterLabel }) {
  const [summary, setSummary] = useState("");
  const [summaryTitle, setSummaryTitle] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [chatArticle, setChatArticle] = useState(null);

  const handleSummary = async (item) => {
    setSummaryTitle(item.title);
    setSummary("");
    setLoadingSummary(true);
    try {
      const id = item._id || item.id;
      const result = item.aiSummary || (id && (await getNewsAISummary(id)));
      setSummary(result || "Summary is not available for this article.");
    } catch (error) {
      console.error("AI Summary Error:", error);
      setSummary("Unable to generate AI summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) return <section className="bg-gray-100 py-8"><div className="max-w-7xl mx-auto px-6 text-center"><h2 className="text-3xl font-bold">Loading Trending News...</h2></div></section>;
  if (!news || news.length === 0) return <section className="bg-gray-100 py-8"><div className="max-w-7xl mx-auto px-6 text-center"><h2 className="text-3xl font-bold text-red-600">No {filterLabel || "Trending"} News</h2></div></section>;

  return (
    <>
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="mb-6 text-4xl font-bold">{filterLabel ? `${filterLabel} News` : "Trending News"}</h2>
          <div className="space-y-6">
            {news.slice(0, 5).map((item, index) => (
              <article key={item._id || item.id} className="grid gap-5 rounded-2xl bg-white p-5 shadow-md transition-shadow hover:shadow-xl sm:grid-cols-[auto_190px_minmax(0,1fr)] lg:grid-cols-[auto_210px_minmax(0,1fr)_auto] lg:items-center">
                <div className="self-start text-4xl font-black text-red-500 sm:pt-2">{String(index + 1).padStart(2, "0")}</div>
                <img src={item.image} alt={item.title} className="h-36 w-full rounded-xl object-cover sm:h-32 sm:w-[190px] lg:h-36 lg:w-[210px]" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-600">{item.source?.name || item.source}</p>
                  <h3 className="mt-2 text-xl font-bold leading-snug line-clamp-2">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">{formatArticleDate(item.publishedAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={item.aiImportance} factors={item.aiScoreFactors} /><FactCheckBadge status={item.factCheckStatus} reason={item.factCheckReason} /><TrendingBadge badge={item.trendingBadge} reason={item.trendingBadgeReason} /></div>
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/article/${item.slug || item._id || item.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white hover:bg-blue-700">Read More</Link>
                    <button onClick={() => handleSummary(item)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white hover:bg-green-700">AI Summary</button>
                  </div>
                  <button onClick={() => setChatArticle(item)} className="rounded-lg border border-violet-600 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">Ask AI</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {(loadingSummary || summary) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl mx-4 rounded-2xl bg-white p-6">
            <h2 className="text-2xl font-bold">AI Summary</h2>
            <p className="mt-2 text-sm text-gray-500">{summaryTitle}</p>
            {loadingSummary ? <p className="mt-5">Generating bullet points...</p> : <div className="mt-5 whitespace-pre-wrap text-gray-700">{summary}</div>}
            <button onClick={() => { setSummary(""); setSummaryTitle(""); }} className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700">Close</button>
          </div>
        </div>
      )}
      {chatArticle && <NewsChatModal article={chatArticle} onClose={() => setChatArticle(null)} />}
    </>
  );
}

export default TrendingNews;
