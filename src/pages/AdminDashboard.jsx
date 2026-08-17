import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/authService";
import API from "../services/api";

const sidebarItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "Posts", path: "/admin/posts" },
  { label: "News", path: "/admin/news" },
  { label: "Media", path: "/admin/media" },
  { label: "Pages", path: "/admin/pages" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Logout", path: null },
];

function AdminLayout({ pageEyebrow, pageTitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = sidebarItems.find((item) => {
    if (item.label === "Logout") return false;
    if (item.path === "/admin") return location.pathname === "/admin";
    if (item.path === "/admin/posts") return location.pathname === "/admin/posts" || location.pathname.startsWith("/admin/posts/");
    if (item.path === "/admin/news") return location.pathname === "/admin/news" || location.pathname.startsWith("/admin/news/");
    return location.pathname === item.path;
  })?.label ?? "Dashboard";

  const handleNav = (item) => {
    if (item.label === "Logout") {
      logoutAdmin();
      navigate("/admin/login", { replace: true });
      return;
    }

    if (item.path) {
      navigate(item.path);
    }

    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="fixed inset-0 z-30 bg-slate-950/55 transition-opacity duration-200 lg:hidden" aria-hidden="true" style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 transition-transform duration-200 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-lg font-black tracking-tight text-white">I</div>
          <div>
            <p className="text-xl font-black tracking-tight text-white">INKL</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Admin</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = item.label === activeItem;
            const isLogout = item.label === "Logout";

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : isLogout
                      ? "mt-5 text-red-200 hover:bg-red-500/10 hover:text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {!isLogout && item.label !== "Dashboard" && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    {item.label === "Posts" ? "12" : item.label === "News" ? "86" : item.label === "Media" ? "204" : item.label === "Analytics" ? "Live" : "12"}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 text-sm font-bold text-white">AD</div>
            <div>
              <p className="text-sm font-semibold text-white">Admin Desk</p>
              <p className="text-xs text-slate-400">Operations</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen((current) => !current)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-700 lg:hidden">☰</button>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{pageEyebrow}</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate("/admin/posts/new")} className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm sm:inline-flex">+ New Post</button>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Today</p>
                <p className="text-sm font-semibold text-slate-800">Aug 12, 2026</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function DashboardCards() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/news/analytics")
      .then((response) => setAnalytics(response.data))
      .catch(() => setError("Dashboard metrics could not be loaded."));
  }, []);

  const stats = [
    { label: "Total News", value: analytics?.totalNews ?? "—", accent: "bg-slate-950 text-white" },
    { label: "Total Blogs", value: analytics?.totalPosts ?? "—", accent: "bg-red-600 text-white" },
    { label: "Published", value: analytics?.published ?? "—", accent: "bg-amber-500 text-slate-900" },
    { label: "Drafts", value: analytics?.drafts ?? "—", accent: "bg-emerald-500 text-slate-950" },
    { label: "Views", value: analytics ? Number(analytics.totalViews || 0).toLocaleString("en-IN") : "—", accent: "bg-violet-500 text-white" },
  ];
  const categoryStats = (analytics?.categories || []).slice(0, 3);

  return (
    <>
      {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.accent} rounded-2xl p-5 shadow-sm ring-1 ring-black/5`}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium opacity-90">{stat.label}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]">Live</span>
            </div>
            <p className="mt-6 text-3xl font-black tracking-tight">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Content</p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Latest updates</h2>
            </div>
            <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">View all</button>
          </div>

          <div className="mt-6 space-y-4">
            {categoryStats.length ? categoryStats.map((item) => (
              <div key={item._id || "uncategorized"} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-sm font-semibold text-slate-900">{item._id || "Uncategorized"}</span>
                <span className="text-sm font-bold text-slate-600">{item.count} items</span>
              </div>
            )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No category data available yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Performance</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Quick stats</h2>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="text-sm font-medium text-slate-600">Published rate</span><p className="mt-3 text-2xl font-black text-slate-950">{analytics ? `${analytics.totalNews + analytics.totalPosts ? Math.round((analytics.published / (analytics.totalNews + analytics.totalPosts)) * 100) : 0}%` : "—"}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="text-sm font-medium text-slate-600">Total content</span><p className="mt-3 text-2xl font-black text-slate-950">{analytics ? (analytics.totalNews || 0) + (analytics.totalPosts || 0) : "—"}</p></div>
          </div>
        </div>
      </section>
    </>
  );
}

function AdminDashboard() {
  return (
    <AdminLayout pageEyebrow="Overview" pageTitle="Dashboard">
      <DashboardCards />
    </AdminLayout>
  );
}

export function AdminPlaceholderPage({ title, eyebrow = "Overview", description }) {
  return (
    <AdminLayout pageEyebrow={eyebrow} pageTitle={title}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-600">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-4 max-w-xl text-base text-slate-600">{description}</p>
        <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
          This is a placeholder page for the admin section. The UI shell remains active while features are being built.
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/news/analytics")
      .then((response) => setAnalytics(response.data))
      .catch(() => setError("Analytics data could not be loaded."));
  }, []);

  const totalContent = (analytics?.totalNews || 0) + (analytics?.totalPosts || 0);
  const cards = [
    ["Total content", totalContent],
    ["Published", analytics?.published ?? "—"],
    ["Drafts", analytics?.drafts ?? "—"],
    ["Total views", analytics ? Number(analytics.totalViews || 0).toLocaleString("en-IN") : "—"],
  ];

  return (
    <AdminLayout pageEyebrow="Analytics" pageTitle="Analytics">
      {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}</p></div>)}
      </section>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Distribution</p>
        <h2 className="mt-2 text-xl font-black text-slate-950">Content by category</h2>
        <div className="mt-5 space-y-3">
          {(analytics?.categories || []).map((item) => <div key={item._id || "uncategorized"} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-800">{item._id || "Uncategorized"}</span><span className="font-bold text-slate-600">{item.count}</span></div>)}
          {!analytics?.categories?.length && <p className="text-sm text-slate-500">No category data available yet.</p>}
        </div>
      </section>
    </AdminLayout>
  );
}

export { AdminLayout };
export default AdminDashboard;
