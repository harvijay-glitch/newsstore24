import API from "./api";

const SESSION_KEY = "inkl-admin-session";

export const getStoredAdminSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return session?.token && session?.user?.role === "admin" ? session : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const loginAdmin = async ({ email, password }) => {
  const response = await API.post("/auth/login", { email, password });
  const session = { token: response.data.token, user: response.data.user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const logoutAdmin = () => localStorage.removeItem(SESSION_KEY);
