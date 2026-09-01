import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { searchNews } from "../services/newsService";
import BrandLogo from "./BrandLogo";
import TrendingBadge from "./TrendingBadge";

function Navbar({ darkMode, newsUpdatedAt }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [now, setNow] = useState(Date.now());

  const menu = [
    { name: "Home", path: "/" },
    { name: "World", path: "/world" },
    { name: "Business", path: "/business" },
    { name: "Crypto", path: "/crypto" },
    { name: "Stock", path: "/stock" },
    { name: "Technology", path: "/technology" },
    { name: "Sports", path: "/sports" },
    { name: "Blog", path: "/blog" },
  ];

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      const data = await searchNews(query);
      setResults(data);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const minutesSinceUpdate = newsUpdatedAt ? Math.max(0, Math.floor((now - new Date(newsUpdatedAt).getTime()) / 60_000)) : null;
  const updateLabel = minutesSinceUpdate === null ? "Loading live news" : minutesSinceUpdate === 0 ? "Updated just now" : `Updated ${minutesSinceUpdate} mins ago`;

  return (
    <nav className={`${darkMode ? "bg-slate-950 text-white" : "bg-white"} shadow-md sticky top-0 z-50`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

        {/* Logo */}
        <BrandLogo />

        {/* Menu */}
        <ul className="hidden xl:flex items-center gap-6">
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-red-600"
                    : `${darkMode ? "text-slate-200" : "text-gray-700"} font-semibold hover:text-red-600 transition`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="relative flex items-center gap-4">

          <input
            type="text"
            placeholder="Search News..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="hidden xl:block border rounded-lg px-4 py-2 w-56 text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Search Results */}
          {results.length > 0 && (
            <div className="absolute top-14 left-0 w-96 bg-white rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">

              {results.map((item) => (
                <Link
                  key={item._id}
                  to={`/article/${item.slug || item._id}`}
                  className="block p-4 border-b hover:bg-gray-100"
                  onClick={() => {
                    setResults([]);
                    setQuery("");
                  }}
                >
                  <h3 className="font-semibold line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </Link>
              ))}

            </div>
          )}

        </div>

      </div>
      <div className={`xl:hidden border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
        <ul className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-3 sm:px-6">
          {menu.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-red-600"
                    : `${darkMode ? "text-slate-200" : "text-gray-700"} font-semibold transition hover:text-red-600`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className={`border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">LIVE</span>
          <span className={`shrink-0 text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{updateLabel}</span>
          <span className={`shrink-0 text-xs font-bold uppercase tracking-wide ${darkMode ? "text-slate-400" : "text-slate-500"}`}>News signals</span>
          {["Trending", "Breaking", "Popular", "Viral"].map((badge) => (
            <Link key={badge} to={`/?trend=${badge}#latest-news`} className="shrink-0 transition-transform hover:scale-105" aria-label={`View ${badge} news`}>
              <TrendingBadge badge={badge} />
            </Link>
          ))}
          <Link to="/#latest-news" className={`shrink-0 text-xs font-bold hover:underline ${darkMode ? "text-slate-300" : "text-slate-600"}`}>All news</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
