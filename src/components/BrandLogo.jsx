import { Link } from "react-router-dom";

function BrandLogo({ footer = false }) {
  return (
    <Link to="/" aria-label="NewsStore24 home" className="group inline-flex items-center gap-2.5">
      <img src="/favicon-ns.svg?v=1" alt="NS" className="h-10 w-10 rounded-xl shadow-lg shadow-red-600/25 transition-transform group-hover:-rotate-6 group-hover:scale-105" />
      <span className="leading-none">
        <span className={`block text-[11px] font-bold uppercase tracking-[0.22em] ${footer ? "text-red-400" : "text-red-600"}`}>Latest Updates</span>
        <span className={`mt-1 block text-2xl font-black tracking-tight ${footer ? "text-white" : "text-slate-950"}`}>NewsStore24</span>
      </span>
    </Link>
  );
}

export default BrandLogo;
