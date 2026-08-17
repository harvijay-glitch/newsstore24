import { useEffect, useState } from "react";
import API from "../services/api";
import { AdminLayout } from "./AdminDashboard";

function AdminMedia() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = () => API.get("/news/admin/media").then((response) => setAssets(response.data.assets || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const upload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { setMessage("Choose an image up to 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await API.post("/news/admin/media", { name: file.name, mimeType: file.type, size: file.size, dataUrl: reader.result });
        setMessage("Image uploaded.");
        load();
      } catch (error) { setMessage(error.response?.data?.message || "Upload failed."); }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const remove = async (id) => { await API.delete(`/news/admin/media/${id}`); load(); };

  return (
    <AdminLayout pageEyebrow="Media" pageTitle="Media Library">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-slate-500">Featured images</p><h2 className="mt-1 text-2xl font-black">Upload and manage media</h2></div><label className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Upload image<input type="file" accept="image/*" onChange={upload} className="hidden" /></label></div>
        {message && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">{message}</p>}
        {loading ? <p className="mt-6 text-slate-500">Loading media...</p> : <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{assets.map((asset) => <div key={asset._id} className="overflow-hidden rounded-2xl border border-slate-200"><img src={asset.url} alt={asset.name} className="aspect-video w-full object-cover" /><div className="p-3"><p className="truncate text-sm font-semibold">{asset.name}</p><button type="button" onClick={() => remove(asset._id)} className="mt-2 text-xs font-semibold text-red-600">Delete</button></div></div>)}{!assets.length && <p className="text-sm text-slate-500">No media uploaded yet.</p>}</div>}
      </div>
    </AdminLayout>
  );
}

export default AdminMedia;
