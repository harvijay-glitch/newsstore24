import API from "./api";

export const getAISummary = async (text) => {
  try {
    const response = await API.post("/ai/summary", {
      text,
    });

    return response.data.summary;
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Unable to generate AI Summary.";
  }
};

export const getNewsAISummary = async (id) => {
  const response = await API.get(`/ai/summary/${id}`);
  return response.data.summary;
};

export const askAIAboutNews = async (article, question) => {
  const response = await API.post("/ai/chat", {
    title: article.title,
    content: `${article.description || ""}\n${article.content || ""}`,
    question,
  });
  return response.data.answer;
};
