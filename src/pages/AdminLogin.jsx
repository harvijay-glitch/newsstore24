import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { getStoredAdminSession, loginAdmin } from "../services/authService";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (getStoredAdminSession()) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin({ email, password });
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl sm:p-9">
        <div className="flex justify-center"><BrandLogo /></div>
        <h1 className="mt-8 text-center text-2xl font-black text-slate-950">Admin login</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Sign in to manage INKL News Portal.</p>
        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
        <label className="mt-6 block text-sm font-bold text-slate-800">Email address</label>
        <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none focus:ring-2 focus:ring-red-500" />
        <label className="mt-4 block text-sm font-bold text-slate-800">Password</label>
        <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none focus:ring-2 focus:ring-red-500" />
        <button disabled={loading} className="mt-7 w-full rounded-lg bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Signing in…" : "Log in"}</button>
      </form>
    </main>
  );
}

export default AdminLogin;
