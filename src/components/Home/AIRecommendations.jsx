import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../../services/newsService";
import { optimizeImage } from "../../utils/optimizeImage";
import { getNewsAISummary } from "../../services/aiService";
import AIImportanceScore from "../AIImportanceScore";
import TrendingBadge from "../TrendingBadge";
import NewsChatModal from "../NewsChatModal";

function AIRecommendations() {
  const [articles, setArticles] = useState([]);
  const [summary, setSummary] = useState("");
  const [summaryTitle, setSummaryTitle] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [chatArticle, setChatArticle] = useState(null);

  useEffect(() => {
    getRecommendations().then(setArticles).catch(() => setArticles([]));
  }, []);

  if (!articles.length) return null;

  const showSummary = async (article) => {
    setSummaryTitle(article.title);
    setSummary("");
    setLoadingSummary(true);
    try {
      const articleId = article._id || article.id;
      const result = article.aiSummary || (articleId && await getNewsAISummary(articleId));
      setSummary(result || "Summary is not available for this article.");
    } catch {
      setSummary("Unable to generate AI summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-violet-700">AI Recommendations</p>
          <h2 className="mt-1 text-4xl font-black">You May Also Like</h2>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <article key={article._id || article.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <img src={optimizeImage(article.image, { width: 640 })} alt={article.title} width="640" height="360" loading="lazy" decoding="async" className="aspect-video h-auto w-full object-cover" />
            <div className="p-4">
              <p className="text-xs font-bold text-red-600">{article.source?.name || article.source}</p>
              <h3 className="mt-2 font-bold leading-snug line-clamp-2">{article.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={article.aiImportance} factors={article.aiScoreFactors} /><TrendingBadge badge={article.trendingBadge} reason={article.trendingBadgeReason} /></div>
              <Link to={`/article/${article.slug || article._id || article.id}`} className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">Read story →</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AIRecommendations;
