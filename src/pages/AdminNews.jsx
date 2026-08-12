import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { AdminLayout } from "./AdminDashboard";

const categoryOptions = ["General", "World", "Business", "Technology", "Sports", "Crypto", "Stock"];
const statusOptions = ["all", "draft", "published", "rejected"];
const aiStatusOptions = ["pending", "processing", "completed", "failed"];

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function getStatusClass(status) {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "draft":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getAiStatusClass(status) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "processing":
      return "bg-sky-100 text-sky-700";
    case "failed":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export function AdminNewsListPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const fetchNews = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("q", search);
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);

      const response = await API.get(`/news/admin/news?${params.toString()}`);
      setNews(response.data.news || []);
      setPages(response.data.pages || 1);
      setTotal(response.data.total || 0);
    } catch (requestError) {
      console.error("Failed to load admin news:", requestError);
      setError("Could not load news from the database.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page, category, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchNews();
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete "${title}" from the news feed? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await API.delete(`/news/admin/news/${id}`);
      fetchNews();
    } catch (requestError) {
      console.error("Delete news item failed:", requestError);
      alert("Could not delete this news item.");
    }
  };

  const handleFeaturedToggle = async (id) => {
    try {
      await API.patch(`/news/admin/news/${id}/featured`);
      fetchNews();
    } catch (requestError) {
      console.error("Toggle featured news failed:", requestError);
      alert("Could not update featured status.");
    }
  };

  return (
    <AdminLayout pageEyebrow="News" pageTitle="News Management">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">News</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">All News</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/news/new")}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            + Add New News
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, source, author..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-red-400"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-red-400"
          >
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Status" : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-red-400"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                  <th className="px-4 py-3 font-semibold">AI Status</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 font-semibold">Views</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      Loading news...
                    </td>
                  </tr>
                ) : news.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      No news found for the current filters.
                    </td>
                  </tr>
                ) : (
                  news.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.title || "Untitled"}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.category || "General"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.source || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.publishedAt || item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${getAiStatusClass(item.aiStatus || "pending")}`}>
                          {item.aiStatus || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${item.featured ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.featured ? "Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.views || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/news/edit/${item._id}`)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeaturedToggle(item._id)}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${item.featured ? "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                          >
                            {item.featured ? "Unfeature" : "Feature"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id, item.title)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Showing {news.length} of {total} items</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-slate-600">Page {page} of {pages}</span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminNewsFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    source: "",
    url: "",
    image: "",
    description: "",
    content: "",
    author: "",
    seoTitle: "",
    metaDescription: "",
    publishedAt: "",
    status: "draft",
    aiStatus: "pending",
    featured: false,
  });

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!isEditing) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await API.get(`/news/admin/news/${id}`);
        const item = response.data.news || {};
        setFormData({
          title: item.title || "",
          category: item.category || "General",
          source: item.source || "",
          url: item.url || "",
          image: item.image || "",
          description: item.description || "",
          content: item.content || "",
          author: item.author || "",
          seoTitle: item.seoTitle || "",
          metaDescription: item.metaDescription || "",
          publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : "",
          status: item.status || "draft",
          aiStatus: item.aiStatus || "pending",
          featured: Boolean(item.featured),
        });
        setAiSummary(item.aiSummary || "");
      } catch (requestError) {
        console.error("Failed to fetch news item for edit:", requestError);
        setError("Could not load this news item.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [id, isEditing]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleGenerateSummary = async () => {
    const textToSummarize = `${formData.title || ""}\n\n${formData.description || ""}\n\n${formData.content || ""}`.trim();

    if (!textToSummarize) {
      setError("Add a title, description, or content before generating an AI summary.");
      return;
    }

    setGeneratingSummary(true);
    setError("");

    try {
      const response = await API.post("/ai/summary", { text: textToSummarize });
      const generatedSummary = response.data.summary || "";
      setAiSummary(generatedSummary);
      setFormData((current) => ({ ...current, aiStatus: "completed" }));
    } catch (requestError) {
      console.error("Generate AI summary failed:", requestError);
      setError(requestError.response?.data?.message || "AI summary generation failed.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSubmit = async (event, nextStatus) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        aiSummary,
        status: nextStatus || formData.status,
        aiStatus: aiSummary ? "completed" : formData.aiStatus,
        featured: Boolean(formData.featured),
        publishedAt: formData.publishedAt || undefined,
      };

      if (isEditing) {
        await API.put(`/news/admin/news/${id}`, payload);
      } else {
        await API.post("/news/admin/news", payload);
      }

      navigate("/admin/news");
    } catch (requestError) {
      console.error("Save news item failed:", requestError);
      setError(requestError.response?.data?.message || "Could not save this news item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageEyebrow="News" pageTitle={isEditing ? "Edit News" : "Add New News"}>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading news editor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageEyebrow="News" pageTitle={isEditing ? "Edit News" : "Add New News"}>
      <form onSubmit={(event) => handleSubmit(event, formData.status)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">News</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{isEditing ? "Edit News Item" : "Add New News"}</h2>
          </div>
          <button type="button" onClick={() => navigate("/admin/news")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            Back to News
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Title</label>
              <input value={formData.title} onChange={(event) => updateField("title", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Source</label>
              <input value={formData.source} onChange={(event) => updateField("source", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Article URL</label>
              <input value={formData.url} onChange={(event) => updateField("url", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Featured Image URL</label>
              <input value={formData.image} onChange={(event) => updateField("image", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
              <textarea value={formData.description} onChange={(event) => updateField("description", event.target.value)} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Content</label>
              <textarea value={formData.content} onChange={(event) => updateField("content", event.target.value)} rows="12" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>
          </div>

          <aside className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
              <select value={formData.category} onChange={(event) => updateField("category", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400">
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
              <select value={formData.status} onChange={(event) => updateField("status", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400">
                {statusOptions.filter((option) => option !== "all").map((option) => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">AI Status</label>
              <select value={formData.aiStatus} onChange={(event) => updateField("aiStatus", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400">
                {aiStatusOptions.map((option) => (
                  <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Author</label>
              <input value={formData.author} onChange={(event) => updateField("author", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Published Date</label>
              <input type="datetime-local" value={formData.publishedAt} onChange={(event) => updateField("publishedAt", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">SEO Title</label>
              <input value={formData.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Meta Description</label>
              <textarea value={formData.metaDescription} onChange={(event) => updateField("metaDescription", event.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <span className="text-sm font-semibold text-slate-700">Featured</span>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
            </label>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={generatingSummary}
                onClick={handleGenerateSummary}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              >
                {generatingSummary ? "Generating..." : aiSummary ? "🔄 Regenerate AI Summary" : "🤖 Generate AI Summary"}
              </button>

              {aiSummary && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">AI Summary</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{aiSummary}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" disabled={saving} onClick={(event) => handleSubmit(event, "draft")} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button type="button" disabled={saving} onClick={(event) => handleSubmit(event, "published")} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {saving ? "Saving..." : "Publish"}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </AdminLayout>
  );
}
