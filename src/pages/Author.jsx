import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuthorArticles } from "../services/newsService";

function Author() {
  const { name } = useParams();
  const [data, setData] = useState({ author: decodeURIComponent(name || ""), articles: [] });

  useEffect(() => { getAuthorArticles(name).then(setData).catch(() => setData({ author: decodeURIComponent(name || ""), articles: [] })); }, [name]);

  return <main className="mx-auto max-w-5xl px-6 py-12">
    <p className="text-sm font-bold uppercase tracking-wide text-red-600">Author profile</p>
    <h1 className="mt-2 text-4xl font-black">{data.author}</h1>
    <p className="mt-3 text-slate-600">Published stories and source-attributed reporting available on AI News.</p>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {data.articles.map((article) => <Link key={article._id} to={`/article/${article._id}`} className="rounded-2xl border border-slate-200 p-5 hover:shadow-md"><p className="text-sm font-bold text-red-600">{article.category}</p><h2 className="mt-2 text-xl font-bold">{article.seoTitle || article.title}</h2><p className="mt-3 text-sm text-slate-600 line-clamp-2">{article.description}</p></Link>)}
    </div>
    {!data.articles.length && <p className="mt-10 text-slate-500">No published articles are available for this author yet.</p>}
  </main>;
}

export default Author;
