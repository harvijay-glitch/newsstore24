import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDailyBrief } from "../services/newsService";

function DailyBrief() {
  const [articles, setArticles] = useState([]);
  useEffect(() => { getDailyBrief().then(setArticles).catch(() => setArticles([])); }, []);
  return <section className="max-w-5xl mx-auto px-6 py-12"><p className="font-semibold text-red-600">MORNING EDITION</p><h1 className="mt-2 text-4xl font-bold">Today&apos;s AI Brief</h1><p className="mt-3 text-gray-600">The top stories to understand in about two minutes.</p><div className="mt-8 space-y-4">{articles.map((item, index) => <Link key={item._id} to={`/article/${item.slug || item._id}`} className="block rounded-xl border p-5 hover:border-red-400"><span className="font-bold text-red-600">{index + 1}. </span><span className="font-semibold">{item.title}</span><p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.aiSummary || item.description}</p></Link>)}</div></section>;
}
export default DailyBrief;
