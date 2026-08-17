import axios from "axios";

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  return "https://newsstore24-1.onrender.com/api";
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
