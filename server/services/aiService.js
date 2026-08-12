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