import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { AdminLayout } from "./AdminDashboard";

const statusOptions = ["all", "draft", "published"];
const categoryOptions = ["General", "World", "Business", "Technology", "Sports", "Crypto", "Stock"];

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || "";
  }, [value]);

  const format = (command, commandValue) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-red-400">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white p-2">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("bold")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100">B</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("italic")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm italic text-slate-700 hover:bg-slate-100">I</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertUnorderedList")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">List</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("formatBlock", "h2")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Heading</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => {
          const enteredUrl = window.prompt("Paste link URL (select the text first)")?.trim();
          if (!enteredUrl) return;
          const url = /^(https?:|mailto:|tel:|\/)/i.test(enteredUrl) ? enteredUrl : `https://${enteredUrl}`;
          format("createLink", url);
        }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">Link</button>
      </div>
      <div ref={editorRef} contentEditable role="textbox" aria-label="Post content" onInput={(event) => onChange(event.currentTarget.innerHTML)} className="min-h-72 p-4 text-slate-900 outline-none" />
    </div>
  );
}

export function AdminPostsListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("q", search);
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);

      const response = await API.get(`/news/admin/posts?${params.toString()}`);
      setPosts(response.data.posts || []);
      setPages(response.data.pages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Failed to load admin posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, status, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPosts();
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (postId, title) => {
    const confirmed = window.confirm(`Delete "${title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await API.delete(`/news/admin/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error("Delete post failed:", error);
      alert("Could not delete this post.");
    }
  };

  return (
    <AdminLayout pageEyebrow="Posts" pageTitle="All Posts">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Posts</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">All Posts</h2>
          </div>
          <button type="button" onClick={() => navigate("/admin/posts/new")} className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700">+ Add New Post</button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts..." className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-red-400" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-red-400">
            {statusOptions.map((item) => (
              <option key={item} value={item}>{item === "all" ? "All Status" : item.charAt(0).toUpperCase() + item.slice(1)}</option>
            ))}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-red-400">
            <option value="all">All Categories</option>
            {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Views</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Loading posts...</td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">No posts found.</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{post.title}</td>
                      <td className="px-4 py-3 text-slate-600">{post.category || "General"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {post.status || "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{post.author || "Admin"}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(post.publishedAt || post.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-600">{post.views || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => navigate(`/admin/posts/edit/${post._id}`)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Edit</button>
                          <button type="button" onClick={() => handleDelete(post._id, post.title)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">Delete</button>
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
          <p className="text-sm text-slate-500">Showing {posts.length} of {total} posts</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <span className="text-sm font-medium text-slate-600">Page {page} of {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AdminPostFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "General",
    image: "",
    description: "",
    content: "",
    seoTitle: "",
    metaDescription: "",
    tags: "",
    author: "NewsStore24 Editorial Desk",
    status: "draft",
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditing) return;
      try {
        const response = await API.get(`/news/admin/posts/${id}`);
        const post = response.data.post || {};
        setFormData({
          title: post.title || "",
          slug: post.slug || "",
          category: post.category || "General",
          image: post.image || "",
          description: post.excerpt || post.description || "",
          content: post.content || "",
          seoTitle: post.seoTitle || "",
          metaDescription: post.metaDescription || "",
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          author: post.author || "NewsStore24 Editorial Desk",
          status: post.status || "draft",
        });
      } catch (error) {
        console.error("Failed to load post for edit:", error);
        alert("Could not load this post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isEditing]);

  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const uploadFeaturedImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      alert("Choose an image up to 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await API.post("/news/admin/media", { name: file.name, mimeType: file.type, size: file.size, dataUrl: reader.result });
        updateField("image", response.data.asset.url);
      } catch (error) {
        alert(error.response?.data?.message || "Image upload failed.");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (nextStatus) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        status: nextStatus,
        tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      };

      if (isEditing) {
        await API.put(`/news/admin/posts/${id}`, payload);
      } else {
        await API.post("/news/admin/posts", payload);
      }

      navigate("/admin/posts");
    } catch (error) {
      console.error("Save post failed:", error);
      alert(error.response?.data?.message || "Could not save the post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Loading post editor...
      </div>
    );
  }

  return (
    <AdminLayout pageEyebrow="Posts" pageTitle={isEditing ? "Edit Post" : "Add New Post"}>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Posts</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{isEditing ? "Edit Post" : "Add New Post"}</h2>
          </div>
          <button type="button" onClick={() => navigate("/admin/posts")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Back to Posts</button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Title</label>
              <input value={formData.title} onChange={(event) => updateField("title", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Slug</label>
              <input value={formData.slug} onChange={(event) => updateField("slug", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Featured Image URL</label>
              <div className="flex gap-2"><input value={formData.image} onChange={(event) => updateField("image", event.target.value)} placeholder="https://example.com/image.jpg" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" /><label className="cursor-pointer rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white">Upload<input type="file" accept="image/*" onChange={uploadFeaturedImage} className="hidden" /></label></div>
              {formData.image && <img src={formData.image} alt="Featured preview" className="mt-3 aspect-video w-full rounded-xl object-cover" />}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Content</label>
              <RichTextEditor value={formData.content} onChange={(value) => updateField("content", value)} />
            </div>
          </div>

          <aside className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
              <select value={formData.category} onChange={(event) => updateField("category", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400">
                {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Tags</label>
              <input value={formData.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="comma, separated, tags" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Excerpt / Short Description</label>
              <textarea value={formData.description} onChange={(event) => updateField("description", event.target.value)} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Author</label>
              <input value={formData.author} onChange={(event) => updateField("author", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">SEO Title</label>
              <input value={formData.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Meta Description</label>
              <textarea value={formData.metaDescription} onChange={(event) => updateField("metaDescription", event.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none focus:border-red-400" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" disabled={saving} onClick={() => handleSubmit("draft")} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60">Save Draft</button>
              <button type="button" disabled={saving} onClick={() => handleSubmit("published")} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">Publish</button>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
