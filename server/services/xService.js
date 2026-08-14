import axios from "axios";

// Post news to X (Twitter) automatically
export const postToX = async (newsArticle) => {
  try {
    if (!process.env.X_API_KEY || !process.env.X_API_SECRET || !process.env.X_BEARER_TOKEN) {
      console.log("X API credentials not configured - skipping X posting");
      return null;
    }

    // Create a concise tweet with news title and link
    const tweetText = `🌍 ${newsArticle.title.substring(0, 100)}...\n\nRead more: ${newsArticle.url}\n\n#NewsStore24 #InternationalNews`;

    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text: tweetText,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Posted to X:", response.data.data.id);
    return response.data.data.id;

  } catch (error) {
    console.error("X posting error:", error.response?.data || error.message);
    return null;
  }
};

// Post news update summary
export const postNewsUpdateToX = async (newsCount) => {
  try {
    if (!process.env.X_BEARER_TOKEN) {
      console.log("X API credentials not configured");
      return null;
    }

    const tweetText = `📰 ${newsCount} new international news ${newsCount === 1 ? "story" : "stories"} just added to NewsStore24! 🌍\n\nStay updated with the latest news from around the world.\n\n#NewsStore24 #LatestNews`;

    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text: tweetText,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Posted update summary to X:", response.data.data.id);
    return response.data.data.id;

  } catch (error) {
    console.error("X update posting error:", error.response?.data || error.message);
    return null;
  }
};
