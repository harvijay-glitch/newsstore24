import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AIImportanceScore from "../components/AIImportanceScore";
import FactCheckBadge from "../components/FactCheckBadge";
import TrendingBadge from "../components/TrendingBadge";

function SavedNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedNews = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/news/saved"
      );

      setNews(res.data.articles || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/news/bookmark/${id}`
      );

      setNews((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSavedNews();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-2xl">
        Loading Saved News...
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-10">
        ⭐ Saved News
      </h1>

      {news.length === 0 ? (
        <div className="text-center text-gray-500 text-xl mt-20">
          No Saved News
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-56 object-cover"
              />

              <div className="p-5">
                <p className="text-red-600 font-semibold">
                  {item.source}
                </p>

                <h2 className="text-xl font-bold mt-2 line-clamp-2">
                  {item.title}
                </h2>

                <p className="text-gray-600 mt-3 line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={item.aiImportance} factors={item.aiScoreFactors} /><FactCheckBadge status={item.factCheckStatus} reason={item.factCheckReason} /><TrendingBadge badge={item.trendingBadge} reason={item.trendingBadgeReason} /></div>

                <div className="flex gap-3 mt-5">
                  <Link
                    to={`/article/${item.slug || item._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Read More
                  </Link>

                  <button
                    onClick={() => removeBookmark(item._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedNews;
