import axios from "axios";

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    return "http://localhost:5000/api";
  }

  return "https://api.newsstore24.com";
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
});

API.interceptors.request.use((config) => {
  const session = localStorage.getItem("inkl-admin-session");
  if (session) {
    try {
      const parsedSession = JSON.parse(session);
      const token = parsedSession?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      localStorage.removeItem("inkl-admin-session");
    }
  }
  return config;
});

export default API;
