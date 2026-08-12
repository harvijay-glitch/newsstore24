import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import HeroSection from "../components/Home/HeroSection";
import TrendingNews from "../components/Home/TrendingNews";
import LatestNews from "../components/Home/LatestNews";
import TrendingSidebar from "../components/Home/TrendingSidebar";
import AIRecommendations from "../components/Home/AIRecommendations";

import { getTopHeadlines } from "../services/newsService";
import { translateTexts } from "../services/translationService";

function Home({ language, onNewsUpdated }) {
  const [news, setNews] = useState([]);
  const [originalNews, setOriginalNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const selectedTrend = searchParams.get("trend");
  const displayedNews = useMemo(() => {
    if (!selectedTrend) return news;

    const trendNews = news.filter((item) => item.trendingBadge === selectedTrend);
    const remainingNews = news.filter((item) => item.trendingBadge !== selectedTrend);

    // Keep the selected trend first, but do not leave empty card slots when
    // there are only a few stories with that badge.
    return [...trendNews, ...remainingNews];
  }, [news, selectedTrend]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const articles = await getTopHeadlines();

        console.log("HOME ARTICLES:", articles);

        setOriginalNews(articles || []);
        setNews(articles || []);
        onNewsUpdated?.(new Date().toISOString());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const refreshTimer = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    if (!originalNews.length) return;
    if (language === "en") { setNews(originalNews); return; }

    let active = true;
    const translateNews = async () => {
      try {
        const textParts = originalNews.flatMap((item) => [item.title || "", item.description || ""]);
        const translated = await translateTexts(textParts, language);
        if (!active) return;
        setNews(originalNews.map((item, index) => ({ ...item, title: translated[index * 2] || item.title, description: translated[index * 2 + 1] || item.description })));
      } catch (error) {
        console.error("News translation failed:", error);
        if (active) setNews(originalNews);
      }
    };
    translateNews();
    return () => { active = false; };
  }, [language, originalNews]);

  return (
    <>
      <HeroSection news={displayedNews} loading={loading} />

      <div className="max-w-7xl mx-auto grid gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div><TrendingNews news={displayedNews} loading={loading} filterLabel={selectedTrend} /><LatestNews news={displayedNews} loading={loading} filterLabel={selectedTrend} /></div>
        {!loading && <div className="lg:sticky lg:top-24 lg:self-start lg:pt-16"><TrendingSidebar news={displayedNews} /></div>}
      </div>
      <AIRecommendations />
    </>
  );
}

export default Home;
