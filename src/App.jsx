import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import BreakingNews from "./components/BreakingNews";
import Footer from "./components/Footer";
import LanguageBar from "./components/LanguageBar";
import SEO from "./components/SEO";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import CategoryNews from "./pages/CategoryNews";
import DailyBrief from "./pages/DailyBrief";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminPostsListPage, AdminPostFormPage } from "./pages/AdminPosts";
import { AdminNewsListPage, AdminNewsFormPage } from "./pages/AdminNews";
import { AdminAnalyticsPage, AdminPlaceholderPage } from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import SavedNews from "./pages/SavedNews";
import Article from "./pages/Article";
import Author from "./pages/Author";
import Search from "./pages/Search";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AdminMedia from "./pages/AdminMedia";
import AdminPages from "./pages/AdminPages";
import CmsPageView from "./pages/CmsPageView";
import { AdvancedAIPage, AdvancedAnalyticsPage, MonetizationPage } from "./pages/AdminAdvanced";

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

      <Routes>
        <Route path="/" element={<Home language={language} onNewsUpdated={setNewsUpdatedAt} />} />
        <Route path="/world" element={<CategoryNews category="world" title="World" />} />
        <Route path="/business" element={<CategoryNews category="business" title="Business" />} />
        <Route path="/crypto" element={<CategoryNews category="crypto" title="Crypto" />} />
        <Route path="/stock" element={<CategoryNews category="stock" title="Stock Market" />} />
        <Route path="/technology" element={<CategoryNews category="technology" title="Technology" />} />
        <Route path="/sports" element={<CategoryNews category="sports" title="Sports" />} />
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
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/advanced-analytics" element={<AdminRoute><AdvancedAnalyticsPage /></AdminRoute>} />
        <Route path="/admin/monetization" element={<AdminRoute><MonetizationPage /></AdminRoute>} />
        <Route path="/admin/advanced-ai" element={<AdminRoute><AdvancedAIPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminPlaceholderPage title="Settings" eyebrow="Settings" description="Settings placeholder. Configuration and preferences will be added later." /></AdminRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/article/:id" element={<Article language={language} />} />
        <Route path="/author/:name" element={<Author />} />
        <Route path="/search" element={<Search />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
