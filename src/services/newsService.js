import API from "./api";

// ==========================
// Get Latest News
// ==========================
export const getTopHeadlines = async () => {
  try {
    const response = await API.get("/news");
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

// ==========================
// Search News
// ==========================
export const searchNews = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({ q: query });
    if (filters.category) params.set("category", filters.category);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const response = await API.get(`/news/search?${params.toString()}`);

    return response.data.articles;
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

// ==========================
// Get Saved News
// ==========================
export const getBookmarkedNews = async () => {
  try {
    const response = await API.get("/news/saved");

    return response.data.articles;
  } catch (error) {
    console.error("Error fetching bookmarked news:", error);
    return [];
  }
};

// ==========================
// Toggle Bookmark
// ==========================
export const toggleBookmark = async (id) => {
  try {
    const response = await API.patch(
      `/news/bookmark/${id}`
    );

    return response.data;
  } catch (error) {
    console.error("Bookmark Error:", error);
    return null;
  }
};

export const getNewsByCategory = async (category) => {
  try {
    const response = await API.get(`/news?category=${encodeURIComponent(category)}`);
    return response.data.articles || [];
  } catch (error) {
    console.error("Category news error:", error);
    return [];
  }
};

export const getDailyBrief = async () => (await API.get("/news/daily-brief")).data.articles || [];
export const getRecommendations = async () => (await API.get("/news/recommendations")).data.articles || [];
export const getAnalytics = async () => (await API.get("/news/analytics")).data;
export const getRelatedNews = async (id) => (await API.get(`/news/${id}/related`)).data.articles || [];
export const getNewsArticle = async (id) => (await API.get(`/news/${id}`)).data.article;
export const getAuthorArticles = async (author) => (await API.get(`/news/author/${encodeURIComponent(author)}`)).data;
