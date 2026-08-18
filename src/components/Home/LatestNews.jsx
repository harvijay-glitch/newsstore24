import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../../services/newsService";
import NewsChatModal from "../NewsChatModal";
import { formatArticleDate } from "../../utils/articleDate";
import AIImportanceScore from "../AIImportanceScore";
import FactCheckBadge from "../FactCheckBadge";
import TrendingBadge from "../TrendingBadge";

function LatestNews({ news, loading, filterLabel }) {
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

  if (loading) return <div className="text-center py-10">Loading Latest News...</div>;
  if (displayedNews.length === 0) return <div className="text-center py-10">No {filterLabel || "Latest"} News</div>;

  return (
    <>
      <section id="latest-news" className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-4xl font-bold mb-8">{filterLabel ? `${filterLabel} News` : "Latest News"}</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((item) => (
            <article key={item._id || item.id} className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-2xl">
              <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
              <div className="p-5">
                <p className="text-sm font-semibold text-red-600">{item.source?.name || item.source}</p>
                <h3 className="mt-3 text-xl font-bold line-clamp-2">{item.title}</h3>
                <p className="mt-3 text-gray-600 line-clamp-3">{item.description}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">{formatArticleDate(item.publishedAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={item.aiImportance} factors={item.aiScoreFactors} /><FactCheckBadge status={item.factCheckStatus} reason={item.factCheckReason} /><TrendingBadge badge={item.trendingBadge} reason={item.trendingBadgeReason} /></div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/article/${item.slug || item._id || item.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white hover:bg-blue-700">Read &amp; AI Summary</Link>
                  <button onClick={() => setChatArticle(item)} className="rounded-lg border border-violet-600 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">Ask AI</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {chatArticle && <NewsChatModal article={chatArticle} onClose={() => setChatArticle(null)} />}
    </>
  );
}

export default LatestNews;
