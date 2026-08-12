import { useState } from "react";
import { askAIAboutNews } from "../services/aiService";

function NewsChatModal({ article, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try { setAnswer(await askAIAboutNews(article, question)); }
    catch { setAnswer("I could not answer right now. Please try again."); }
    finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><div><h2 className="text-2xl font-bold">Ask AI about this news</h2><p className="mt-1 text-sm text-gray-500 line-clamp-2">{article.title}</p></div><button onClick={onClose} className="text-2xl text-gray-500">×</button></div><form onSubmit={ask} className="mt-5 flex gap-2"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about this article..." className="min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"/><button className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">Ask</button></form>{(loading || answer) && <div className="mt-5 rounded-xl bg-slate-100 p-4 text-gray-700">{loading ? "Thinking..." : answer}</div>}</div></div>;
}

export default NewsChatModal;
