import { useState } from "react";
import { Link } from "react-router-dom";
import { searchNews } from "../services/newsService";

function Search() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", from: "", to: "" });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setResults(await searchNews(query, filters));
    setSearched(true);
  };

  return <main className="mx-auto max-w-6xl px-6 py-12">
    <h1 className="text-4xl font-black">Search News</h1>
    <form onSubmit={submit} className="mt-7 grid gap-3 rounded-2xl bg-slate-50 p-5 md:grid-cols-4">
      <input value={query} onChange={(event) => setQuery(event.target.value)} required placeholder="Keyword or topic" className="rounded-lg border bg-white px-4 py-3 md:col-span-2" />
      <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="rounded-lg border bg-white px-3 py-3"><option value="">All categories</option>{["india", "world", "business", "technology", "sports", "entertainment", "science", "crypto", "stock"].map((category) => <option key={category}>{category}</option>)}</select>
      <button className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white">Search</button>
      <label className="text-sm font-semibold">From<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2" /></label>
      <label className="text-sm font-semibold">To<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className="mt-1 block w-full rounded-lg border bg-white px-3 py-2" /></label>
    </form>
    {searched && <p className="mt-7 font-semibold text-slate-600">{results.length} matching stories</p>}
    <div className="mt-5 grid gap-5 md:grid-cols-3">{results.map((article) => <Link key={article._id} to={`/article/${article._id}`} className="rounded-2xl border border-slate-200 p-5 hover:shadow-md"><p className="text-sm font-bold text-red-600">{article.category}</p><h2 className="mt-2 text-xl font-bold line-clamp-2">{article.seoTitle || article.title}</h2><p className="mt-3 text-sm text-slate-600 line-clamp-3">{article.description}</p></Link>)}</div>
  </main>;
}

export default Search;
