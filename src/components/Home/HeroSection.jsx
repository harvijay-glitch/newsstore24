import { Link } from "react-router-dom";
import { formatArticleDate } from "../../utils/articleDate";
import { optimizeImage } from "../../utils/optimizeImage";
import AIImportanceScore from "../AIImportanceScore";
import FactCheckBadge from "../FactCheckBadge";
import TrendingBadge from "../TrendingBadge";

function HeroSection({ news, loading }) {
  const [mainNews, ...sideNews] = (news || []).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
        <div>
          <span className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">LIVE NEWS</span>
          <h1 className="text-3xl md:text-4xl font-black mt-6 leading-tight">AI Powered News<br />For The Modern World</h1>
          <p className="text-gray-600 text-lg mt-6">Read breaking news from around the world with AI-powered summaries, real-time updates, trending stories and personalized recommendations.</p>
          <div className="flex gap-4 mt-8">
            <a href="#latest-news" className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700">Explore News</a>
            <a href="#latest-news" className="border px-8 py-3 rounded-xl hover:bg-gray-100">AI Summary</a>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured News</h2>
            <a href="#latest-news" className="text-sm font-semibold text-blue-600 hover:underline">View all →</a>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-[1.35fr_0.85fr]">
              <div className="animate-pulse rounded-2xl bg-slate-200" style={{ aspectRatio: "20 / 9" }} />
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-16 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-16 animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
          ) : mainNews ? (
            <div className="grid gap-4 md:grid-cols-[1.35fr_0.85fr]">
              <article>
                <img src={optimizeImage(mainNews.image, { width: 800 })} alt={mainNews.title} width="800" height="360" fetchPriority="high" decoding="async" className="w-full rounded-2xl object-cover" style={{ aspectRatio: "20 / 9" }} />
                <p className="mt-3 text-sm font-bold text-red-600">{mainNews.source?.name || mainNews.source}</p>
                <h3 className="mt-1 text-xl font-bold leading-tight line-clamp-2">{mainNews.title}</h3>
                <p className="mt-2 text-xs font-medium text-slate-500">{formatArticleDate(mainNews.publishedAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2"><AIImportanceScore score={mainNews.aiImportance} factors={mainNews.aiScoreFactors} /><FactCheckBadge status={mainNews.factCheckStatus} reason={mainNews.factCheckReason} /><TrendingBadge badge={mainNews.trendingBadge} reason={mainNews.trendingBadgeReason} /></div>
                <Link to={`/article/${mainNews.slug || mainNews._id || mainNews.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">Read full story →</Link>
              </article>

              <div className="divide-y divide-slate-200">
                {sideNews.map((item) => (
                  <article key={item._id || item.id} className="flex gap-3 py-3 first:pt-0">
                    <img src={optimizeImage(item.image, { width: 160 })} alt={item.title} width="80" height="64" loading="lazy" decoding="async" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-600">{item.source?.name || item.source}</p>
                      <h3 className="mt-1 text-sm font-bold leading-snug line-clamp-2">{item.title}</h3>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">{formatArticleDate(item.publishedAt)}</p>
                      <Link to={`/article/${item.slug || item._id || item.id}`} className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:underline">Read more →</Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-2xl bg-slate-100 p-8 text-center text-slate-600">Featured news will appear here once news is available.</div>
          )}
        </section>
      </div>
    </section>
  );
}

export default HeroSection;
