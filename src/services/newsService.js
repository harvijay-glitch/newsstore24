






































import API from "./api";

const articlesFrom = (response) => response.data.articles || [];
let recommendationsCache = null;
let recommendationsCachedAt = 0;
let recommendationsRequest = null;

export const getTopHeadlines = async (category = "") => {
  const response = await API.get("/news", { params: category ? { category } : {} });
  return articlesFrom(response);
};

export const getNewsByCategory = async (category) => {
  const response = await API.get("/news", { params: { category } });
  return articlesFrom(response);
};

export const searchNews = async (query, filters = {}) => {
  const response = await API.get("/news/search", { params: { q: query, ...filters } });
  return articlesFrom(response);
};

export const getNewsArticle = async (id) => {
  const response = await API.get(`/news/${id}`);
  return response.data.article;
};

export const getRelatedNews = async (id) => {
  const response = await API.get(`/news/${id}/related`);
  return response.data.articles || [];
};

export const getAuthorArticles = async (name) => {
  const response = await API.get(`/news/author/${encodeURIComponent(name)}`);
  return { author: response.data.author, articles: response.data.articles || [] };
};

export const getDailyBrief = async () => {
  const response = await API.get("/news/daily-brief");
  return response.data.articles || [];
};

export const getRecommendations = async () => {
  if (recommendationsCache && Date.now() - recommendationsCachedAt < 10 * 60 * 1000) return recommendationsCache;
  if (!recommendationsRequest) {
    recommendationsRequest = API.get("/news/recommendations")
      .then((response) => response.data.articles || [])
      .then((articles) => {
        recommendationsCache = articles;
        recommendationsCachedAt = Date.now();
        return articles;
      })
      .finally(() => { recommendationsRequest = null; });
  }
  return recommendationsRequest;
};
// Fetch News
