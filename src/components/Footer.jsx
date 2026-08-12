import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

function Footer() {
  const links = [
    ["Home", "/"], ["World", "/world"], ["Business", "/business"], ["Technology", "/technology"],
    ["Sports", "/sports"], ["Crypto", "/crypto"], ["Contact", "/contact"],
  ];
  const legalLinks = [["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"]];
  const socialLinks = [
    { label: "Instagram", icon: "◎" },
    { label: "Facebook", icon: "f" },
    { label: "X", icon: "𝕏" },
  ];

  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <BrandLogo footer />
            <span className="hidden h-9 w-px bg-slate-700 sm:block" />
            <p className="max-w-xs text-sm leading-5 text-slate-400">Smarter updates for the stories shaping your day.</p>
            <div className="flex items-center gap-2" aria-label="Social media links">
              {socialLinks.map(({ label, icon }) => (
                <button key={label} type="button" title={`${label} link coming soon`} aria-label={label} className="grid h-8 w-8 place-items-center rounded-full border border-slate-700 text-sm font-bold text-slate-300 transition hover:border-red-500 hover:bg-red-600 hover:text-white">
                  {icon}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-6 border-t border-slate-800 pt-5 text-sm">
          {links.map(([label, path]) => <Link key={path} to={path} style={{ marginRight: "1.5rem", marginBottom: "0.5rem" }} className="inline-block transition hover:text-red-400">{label}</Link>)}
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} AI News. All rights reserved.</span>
          <div className="flex gap-4">{legalLinks.map(([label, path]) => <Link key={path} to={path} className="hover:text-slate-300">{label}</Link>)}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
