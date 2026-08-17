






































import API from "./api";

const articlesFrom = (response) => response.data.articles || [];

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
  const response = await API.get("/news/recommendations");
  return response.data.articles || [];
};
// Fetch News
