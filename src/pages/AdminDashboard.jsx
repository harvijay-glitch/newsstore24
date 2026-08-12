import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/authService";

const sidebarItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "Posts", path: "/admin/posts" },
  { label: "News", path: "/admin/news" },
  { label: "Media", path: "/admin/media" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Logout", path: null },
];

const stats = [
  { label: "Total News", value: "1,284", accent: "bg-slate-950 text-white" },
  { label: "Total Blogs", value: "368", accent: "bg-red-600 text-white" },
  { label: "Published", value: "1,092", accent: "bg-amber-500 text-slate-900" },
  { label: "Drafts", value: "146", accent: "bg-emerald-500 text-slate-950" },
  { label: "Views", value: "89.4K", accent: "bg-violet-500 text-white" },
  { label: "Bookmarks", value: "12.8K", accent: "bg-sky-500 text-white" },
];

const latestPosts = [
  { title: "Market sentiment remains mixed as global investors rebalance risk", status: "Published", date: "2 hours ago" },
  { title: "Startup founders are rethinking AI hiring after a brutal quarter", status: "Draft", date: "Today" },
  { title: "Urban transit upgrades push clean mobility to the top of municipal agendas", status: "Scheduled", date: "Yesterday" },
];

const performance = [
  { label: "Engagement", value: "67%", change: "+8.4%" },
  { label: "Avg. session", value: "4m 32s", change: "+1.2m" },
  { label: "CTR", value: "24.8%", change: "+3.1%" },
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
  return (
    <>
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
            {latestPosts.map((post) => (
              <div key={post.title} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{post.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{post.date}</p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${post.status === "Published" ? "bg-emerald-100 text-emerald-700" : post.status === "Draft" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Performance</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Quick stats</h2>
          </div>

          <div className="mt-6 space-y-4">
            {performance.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">{metric.change}</span>
                </div>
                <p className="mt-3 text-2xl font-black text-slate-950">{metric.value}</p>
              </div>
            ))}
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

export { AdminLayout };
export default AdminDashboard;
