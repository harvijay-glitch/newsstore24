import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import BreakingNews from "./components/BreakingNews";
import Footer from "./components/Footer";
import LanguageBar from "./components/LanguageBar";
import SEO from "./components/SEO";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import CategoryNews from "./pages/CategoryNews";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

const DailyBrief = lazy(() => import("./pages/DailyBrief"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPostsListPage = lazy(() => import("./pages/AdminPosts").then((module) => ({ default: module.AdminPostsListPage })));
const AdminPostFormPage = lazy(() => import("./pages/AdminPosts").then((module) => ({ default: module.AdminPostFormPage })));
const AdminNewsListPage = lazy(() => import("./pages/AdminNews").then((module) => ({ default: module.AdminNewsListPage })));
const AdminNewsFormPage = lazy(() => import("./pages/AdminNews").then((module) => ({ default: module.AdminNewsFormPage })));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const SavedNews = lazy(() => import("./pages/SavedNews"));
const Article = lazy(() => import("./pages/Article"));
const Author = lazy(() => import("./pages/Author"));
const Search = lazy(() => import("./pages/Search"));
const AdminMedia = lazy(() => import("./pages/AdminMedia"));
const AdminPages = lazy(() => import("./pages/AdminPages"));
const CmsPageView = lazy(() => import("./pages/CmsPageView"));
const AdvancedAnalyticsPage = lazy(() => import("./pages/AdminAdvanced").then((module) => ({ default: module.AdvancedAnalyticsPage })));
const MonetizationPage = lazy(() => import("./pages/AdminAdvanced").then((module) => ({ default: module.MonetizationPage })));
const AdvancedAIPage = lazy(() => import("./pages/AdminAdvanced").then((module) => ({ default: module.AdvancedAIPage })));

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("inkl-dark") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("newsstore24-language") || "en");
  const [newsUpdatedAt, setNewsUpdatedAt] = useState(null);
  const toggleDarkMode = () => setDarkMode((current) => { localStorage.setItem("inkl-dark", String(!current)); return !current; });
  const changeLanguage = (nextLanguage) => { localStorage.setItem("newsstore24-language", nextLanguage); setLanguage(nextLanguage); };
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className={darkMode ? "min-h-screen bg-slate-900 text-slate-100" : "min-h-screen bg-white text-slate-950"}>
      <SEO />
      {!isAdminRoute && <><LanguageBar language={language} onLanguageChange={changeLanguage} /><Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} newsUpdatedAt={newsUpdatedAt} /><BreakingNews /></>}

      <Suspense fallback={<div className="min-h-[40vh] p-8 text-center text-slate-600">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<Home language={language} onNewsUpdated={setNewsUpdatedAt} />} />
        <Route path="/world" element={<CategoryNews category="world" title="World" />} />
        <Route path="/business" element={<CategoryNews category="business" title="Business" />} />
        <Route path="/crypto" element={<CategoryNews category="crypto" title="Crypto" />} />
        <Route path="/stock" element={<CategoryNews category="stock" title="Stock Market" />} />
        <Route path="/technology" element={<CategoryNews category="technology" title="Technology" />} />
        <Route path="/sports" element={<CategoryNews category="sports" title="Sports" />} />
        <Route path="/blog" element={<CategoryNews category="blog" title="Blog" />} />
        <Route path="/contact" element={<CmsPageView />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/saved" element={<SavedNews />} />
        <Route path="/daily-brief" element={<DailyBrief />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/posts" element={<AdminRoute><AdminPostsListPage /></AdminRoute>} />
        <Route path="/admin/posts/new" element={<AdminRoute><AdminPostFormPage /></AdminRoute>} />
        <Route path="/admin/posts/edit/:id" element={<AdminRoute><AdminPostFormPage /></AdminRoute>} />
        <Route path="/admin/news" element={<AdminRoute><AdminNewsListPage /></AdminRoute>} />
        <Route path="/admin/news/new" element={<AdminRoute><AdminNewsFormPage /></AdminRoute>} />
        <Route path="/admin/news/edit/:id" element={<AdminRoute><AdminNewsFormPage /></AdminRoute>} />
        <Route path="/admin/media" element={<AdminRoute><AdminMedia /></AdminRoute>} />
        <Route path="/admin/pages" element={<AdminRoute><AdminPages /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminDashboard.AdminAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/advanced-analytics" element={<AdminRoute><AdvancedAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/monetization" element={<AdminRoute><MonetizationPage /></AdminRoute>} />
        <Route path="/admin/advanced-ai" element={<AdminRoute><AdvancedAIPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminDashboard.AdminPlaceholderPage title="Settings" eyebrow="Settings" description="Settings placeholder. Configuration and preferences will be added later." /></AdminRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/article/:id" element={<Article language={language} />} />
        <Route path="/author/:name" element={<Author />} />
        <Route path="/search" element={<Search />} />
        <Route path="/livingMagazine" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
