import { Link } from "react-router-dom";

function BrandLogo({ footer = false }) {
  return (
    <Link to="/" aria-label="NewsStore24 home" className="group inline-flex items-center gap-2.5">
      <img src="/newsstore24-logo.svg" alt="NewsStore24 - Latest Updates" className={`h-auto w-[210px] transition-transform group-hover:scale-[1.02] ${footer ? "brightness-0 invert" : ""}`} />
    </Link>
  );
}

export default BrandLogo;
