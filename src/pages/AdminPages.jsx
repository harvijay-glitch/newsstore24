import { useEffect, useState } from "react";
import API from "../services/api";
import { AdminLayout } from "./AdminDashboard";

const pageSlugs = ["about", "contact", "privacy", "terms"];

function AdminPages() {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState("about");
  const [form, setForm] = useState({ slug: "about", title: "", content: "", seoTitle: "", metaDescription: "", status: "published" });
  const [message, setMessage] = useState("");

  useEffect(() => { API.get("/news/admin/pages").then((response) => setPages(response.data.pages || [])).catch(() => setMessage("Pages could not be loaded.")); }, []);
  useEffect(() => { const page = pages.find((item) => item.slug === selected); setForm(page ? { ...page } : { slug: selected, title: selected[0].toUpperCase() + selected.slice(1), content: "", seoTitle: "", metaDescription: "", status: "published" }); }, [selected, pages]);

  const save = async (event) => { event.preventDefault(); try { const response = await API.put("/news/admin/pages", form); setPages((current) => [...current.filter((item) => item.slug !== form.slug), response.data.page]); setMessage("Page saved."); } catch (error) { setMessage(error.response?.data?.message || "Page could not be saved."); } };
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return <AdminLayout pageEyebrow="Pages" pageTitle="Pages CMS"><div className="grid gap-6 lg:grid-cols-[220px_1fr]"><nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">{pageSlugs.map((slug) => <button key={slug} type="button" onClick={() => setSelected(slug)} className={`block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold capitalize ${selected === slug ? "bg-red-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}>{slug}</button>)}</nav><form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-sm font-semibold text-slate-500">Editable public page</p><h2 className="mt-1 text-2xl font-black capitalize">{selected}</h2>{message && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p>}<label className="mt-5 block text-sm font-semibold">Title<input value={form.title} onChange={(event) => update("title", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3" /></label><label className="mt-4 block text-sm font-semibold">Content<textarea value={form.content} onChange={(event) => update("content", event.target.value)} rows="12" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3" /></label><label className="mt-4 block text-sm font-semibold">SEO title<input value={form.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3" /></label><label className="mt-4 block text-sm font-semibold">Meta description<textarea value={form.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} rows="3" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3" /></label><button className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white">Save page</button></form></div></AdminLayout>;
}

export default AdminPages;
