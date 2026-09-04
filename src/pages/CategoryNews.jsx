import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsByCategory } from "../services/newsService";
import { optimizeImage } from "../utils/optimizeImage";
import AIImportanceScore from "../components/AIImportanceScore";
import FactCheckBadge from "../components/FactCheckBadge";
import TrendingBadge from "../components/TrendingBadge";

function CategoryNews({ category, title }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setNews(await getNewsByCategory(category));
      setLoading(false);
    };
    loadNews();
  }, [category]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold">{title} News</h1>
      <p className="mt-2 text-gray-600">Latest stories and updates from {title}.</p>
      {loading ? (
        <p className="py-16 text-center text-lg">Loading news...</p>
      ) : news.length === 0 ? (
        <p className="py-16 text-center text-lg text-gray-500">No {title.toLowerCase()} news is available right now.</p>
      ) : (
        <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article key={item._id || item.id} className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl">
              <img src={optimizeImage(item.image, { width: 480 })} alt={item.title} width="480" height="208" loading="lazy" decoding="async" className="h-52 w-full object-cover" />
              <div className="p-5">
                <p className="text-sm font-semibold text-red-600">{item.source?.name || item.source}</p>
                <h2 className="mt-2 text-xl font-bold line-clamp-2">{item.title}</h2>
                <p className="mt-3 text-sm text-gray-600 line-clamp-3">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={item.aiImportance} factors={item.aiScoreFactors} /><FactCheckBadge status={item.factCheckStatus} reason={item.factCheckReason} /><TrendingBadge badge={item.trendingBadge} reason={item.trendingBadgeReason} /></div>
                <Link to={`/article/${item.slug || item._id || item.id}`} className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Read More</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryNews;
