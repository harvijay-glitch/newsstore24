const badgeStyles = {
  Verified: "bg-emerald-50 text-emerald-700",
  Developing: "bg-amber-50 text-amber-700",
  Rumor: "bg-red-50 text-red-700",
};

const badgeLabels = {
  Verified: "✅ Verified",
  Developing: "⚠ Developing",
  Rumor: "❌ Rumor",
};

function FactCheckBadge({ status = "Developing", reason = "" }) {
  const safeStatus = badgeLabels[status] ? status : "Developing";
  const title = `${reason || "Automated source-based classification."} Not an independent fact-check.`;

  return <span title={title} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyles[safeStatus]}`}>{badgeLabels[safeStatus]}</span>;
}

export default FactCheckBadge;
