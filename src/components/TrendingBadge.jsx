const badgeStyles = {
  Trending: "bg-orange-50 text-orange-700",
  Breaking: "bg-red-50 text-red-700",
  Popular: "bg-amber-50 text-amber-700",
  Viral: "bg-violet-50 text-violet-700",
};

const badgeLabels = {
  Trending: "🔥 Trending",
  Breaking: "🚀 Breaking",
  Popular: "⭐ Popular",
  Viral: "📈 Viral",
};

function TrendingBadge({ badge = "Trending", reason = "" }) {
  const safeBadge = badgeLabels[badge] ? badge : "Trending";
  return <span title={reason || "Automated news-interest classification."} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyles[safeBadge]}`}>{badgeLabels[safeBadge]}</span>;
}

export default TrendingBadge;
