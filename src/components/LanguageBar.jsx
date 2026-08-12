import { useEffect, useState } from "react";

const languages = [
  ["हिन्दी", "hi"], ["English", "en"], ["मराठी", "mr"], ["বাংলা", "bn"], ["தமிழ்", "ta"], ["മലയാളം", "ml"],
  ["ગુજરાતી", "gu"], ["తెలుగు", "te"], ["ಕನ್ನಡ", "kn"], ["ଓଡ଼ିଆ", "or"],
];

function getDateTime() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short", month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata",
  }).format(new Date()).replace(",", "");
}

function LanguageBar({ language, onLanguageChange }) {
  const [dateTime, setDateTime] = useState(getDateTime);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(getDateTime()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-red-400 bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-1.5 text-xs font-semibold sm:px-6">
        <span className="shrink-0 font-bold">{dateTime} IST</span>
        <div className="flex items-center gap-4">
          {languages.map(([label, code]) => <button key={code} type="button" onClick={() => onLanguageChange(code)} className={`shrink-0 transition hover:text-red-100 hover:underline ${language === code ? "font-black underline" : ""}`}>{label}</button>)}
        </div>
      </div>
    </div>
  );
}

export default LanguageBar;
