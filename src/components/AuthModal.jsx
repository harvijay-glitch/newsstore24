import { useState } from "react";

function AuthModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin({ email, password });
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="admin-login-title" className="text-2xl font-bold text-slate-950">Admin login</h2><p className="mt-1 text-sm text-slate-600">Use your secure INKL administrator account.</p></div>
          <button type="button" onClick={onClose} aria-label="Close login" className="text-2xl leading-none text-slate-500 hover:text-slate-900">×</button>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
        <label className="mt-5 block text-sm font-bold text-slate-800">Email address</label>
        <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:ring-2 focus:ring-red-500" />
        <label className="mt-4 block text-sm font-bold text-slate-800">Password</label>
        <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:ring-2 focus:ring-red-500" />
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

export default AuthModal;
