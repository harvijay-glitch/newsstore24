function AIImportanceScore({ score, factors }) {
  const value = Number(score);
  if (!Number.isFinite(value) || value <= 0) return <span className="text-xs font-semibold text-slate-500">AI score calculating...</span>;

  const title = factors
    ? `Trending: ${factors.trending}/10 | Source quality: ${factors.sourceQuality}/10 | Impact: ${factors.impact}/10 | Search interest: ${factors.searchVolume}/10 | Freshness: ${factors.freshness}/10`
    : "AI importance score";

  return <span title={title} className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">🔥 AI Importance: {value.toFixed(1)}/10</span>;
}

export default AIImportanceScore;
