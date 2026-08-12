export const formatArticleDate = (publishedAt) => {
  if (!publishedAt || Number.isNaN(new Date(publishedAt).getTime())) return "Updated recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(publishedAt));
};
