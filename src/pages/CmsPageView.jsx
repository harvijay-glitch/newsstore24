import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function CmsPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  useEffect(() => { API.get(`/news/pages/${slug}`).then((response) => setPage(response.data.page)); }, [slug]);
  if (!page) return <main className="mx-auto max-w-4xl px-6 py-14 text-slate-500">Loading page...</main>;
  return <main className="mx-auto max-w-4xl px-6 py-14"><p className="text-sm font-bold uppercase tracking-wider text-red-600">NewsStore24</p><h1 className="mt-3 text-4xl font-extrabold text-slate-950">{page.title}</h1><div className="mt-8 whitespace-pre-line leading-8 text-slate-600">{page.content}</div></main>;
}

export default CmsPageView;
