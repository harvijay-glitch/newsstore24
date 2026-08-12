import { Link } from "react-router-dom";

function TrendingSidebar({ news }) {
  const topics = ["World", "Business", "Technology", "Sports"];

  return (
    <aside className="space-y-5">
      <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">📈 Trending Now</h2>
        <div className="mt-4 divide-y divide-slate-700">
          {(news || []).slice(0, 5).map((item, index) => (
            <Link key={item._id || item.id} to={`/article/${item.slug || item._id || item.id}`} className="flex gap-3 py-4 hover:text-red-300">
              <span className="text-2xl font-black text-red-400">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0"><p className="text-xs font-semibold text-red-300">{item.source?.name || item.source}</p><h3 className="mt-1 text-sm font-semibold line-clamp-2">{item.title}</h3></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-5 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-red-100">AI Daily Brief</p>
        <h2 className="mt-2 text-xl font-black">The day&apos;s biggest stories, in minutes.</h2>
        <p className="mt-2 text-sm leading-6 text-red-100">A quick digest of the news you should know today.</p>
        <Link to="/daily-brief" className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50">Open daily brief →</Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Explore topics</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {topics.map((topic) => <Link key={topic} to={`/${topic.toLowerCase()}`} className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700">{topic}</Link>)}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white p-2 shadow-sm">
        <img src="/ai-apply-banner.png" alt="AIApply career tools" className="w-full rounded-xl" />
      </section>
    </aside>
  );
}

export default TrendingSidebar;
