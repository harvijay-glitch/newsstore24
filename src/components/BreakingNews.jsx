import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../services/newsService";

function BreakingNews() {
  const [headlines, setHeadlines] = useState([]);

  useEffect(() => {
    const loadHeadlines = () => getRecommendations()
      .then((articles) => setHeadlines(articles.slice(0, 8)))
      .catch(() => setHeadlines([]));

    loadHeadlines();
    const refreshTimer = setInterval(loadHeadlines, 10 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, []);

  return (
    <div className="bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <span className="rounded bg-white px-3 py-1 font-bold text-red-600">BREAKING</span>

        <marquee className="flex-1" scrollamount="6">
          {headlines.length ? headlines.map((article, index) => (
            <span key={article._id || article.id}>
              <Link to={`/article/${article.slug || article._id || article.id}`} className="font-medium hover:underline">{article.title}</Link>
              {index < headlines.length - 1 && <span className="mx-4">&bull;</span>}
            </span>
          )) : "Loading trending headlines..."}
        </marquee>
      </div>
    </div>
  );
}

export default BreakingNews;
