import API from "./api";

export const translateTexts = async (texts, target) => {
  const response = await API.post("/translate", { texts, target, source: "en" });
  return response.data.translatedTexts || texts;
};
