import { Link } from "react-router-dom";

function FeaturedNews({ news, loading }) {
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-14 text-center">
        <h2 className="text-3xl font-bold">Loading Latest News...</h2>
      </section>
    );
  }

  if (!news || news.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-14 text-center">
        <h2 className="text-3xl font-bold text-red-600">
          No News Available
        </h2>
      </section>
    );
  }

  const mainNews = news[0];
  const sideNews = news.slice(1, 4);

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">🔥 Featured News</h2>

        <button className="text-blue-600 font-semibold hover:underline">
          View All →
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img
            src={mainNews.image}
            alt={mainNews.title}
            width="900"
            height="420"
            loading="lazy"
            decoding="async"
            className="aspect-[15/7] h-auto w-full rounded-3xl object-cover"
          />

          <p className="text-red-600 font-semibold mt-5">
            {mainNews.source?.name}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {mainNews.title}
          </h2>

          <p className="text-gray-600 mt-4">
            {mainNews.description}
          </p>

          <Link
            to={`/article/${mainNews.slug || mainNews._id || mainNews.id}`}
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Read Full News
          </Link>
        </div>

        <div className="space-y-6">
          {sideNews.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border-b pb-5"
            >
              <img
                src={item.image}
                alt={item.title}
                width="128"
                height="96"
                loading="lazy"
                decoding="async"
                className="h-24 w-32 rounded-xl object-cover"
              />

              <div>
                <p className="text-red-600 text-sm font-semibold">
                  {item.source?.name}
                </p>

                <h3 className="font-bold mt-2 line-clamp-2">
                  {item.title}
                </h3>

                <Link
                  to={`/article/${item.slug || item._id || item.id}`}
                  className="text-blue-600 text-sm mt-2 inline-block"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedNews;
