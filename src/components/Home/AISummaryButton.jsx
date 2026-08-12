function AISummaryButton({ article }) {
  const handleSummary = () => {
    alert("🤖 AI Summary feature coming in next step...");
  };

  return (
    <button
      onClick={handleSummary}
      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
    >
      🤖 AI Summary
    </button>
  );
}

export default AISummaryButton;