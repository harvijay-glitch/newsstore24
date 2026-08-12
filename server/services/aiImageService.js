import axios from "axios";
import mongoose from "mongoose";
import News from "../models/News.js";

const IMAGE_TIMEOUT_MS = Number(process.env.OPENAI_IMAGE_TIMEOUT_MS || 60000);

const buildPrompt = ({ title, description, category }) => `
Use case: photorealistic-natural
Asset type: editorial news article cover image
Primary request: Create an original editorial cover image that represents this news story without reproducing any source image.
Headline context: ${title}
Supporting context: ${description}
Category: ${category || "General"}
Composition/framing: landscape 3:2 composition, clear central subject, suitable for a responsive news website.
Style/medium: high-quality photojournalistic editorial illustration, realistic and restrained.
Constraints: depict only facts reasonably supported by the headline/context; no text, captions, logos, watermarks, brand marks, public-figure lookalikes, or graphic violence.
`;

const storeInGridFS = async ({ bytes, articleId }) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "newsImages" });
  const upload = bucket.openUploadStream(`article-${articleId}.webp`, {
    contentType: "image/webp",
    metadata: { articleId: String(articleId), generatedBy: "gpt-image-2" },
  });
  await new Promise((resolve, reject) => {
    upload.on("error", reject);
    upload.on("finish", resolve);
    upload.end(bytes);
  });
  return upload.id.toString();
};

// One optional cover generation per imported article. It never blocks article
// publication: if images are unavailable, the original provider image stays live.
export const generateAndStoreArticleImage = async (article) => {
  if (!process.env.OPENAI_API_KEY) return { status: "not_requested" };

  await News.updateOne(
    { _id: article._id, generatedImageStatus: "not_requested" },
    { $set: { generatedImageStatus: "processing", generatedImageError: "" } }
  );

  try {
    const response = await axios.post("https://api.openai.com/v1/images/generations", {
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      prompt: buildPrompt(article),
      size: "1536x1024",
      quality: process.env.OPENAI_IMAGE_QUALITY || "low",
      output_format: "webp",
    }, {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      timeout: IMAGE_TIMEOUT_MS,
    });

    const base64 = response.data?.data?.[0]?.b64_json;
    if (!base64) throw new Error("Image provider returned no image data");
    const fileId = await storeInGridFS({ bytes: Buffer.from(base64, "base64"), articleId: article._id });
    const generatedImageUrl = `/api/news/image/${fileId}`;
    await News.updateOne({ _id: article._id }, { $set: { generatedImageUrl, generatedImageStatus: "completed", generatedImageError: "" } });
    console.log("AI cover completed:", article.title);
    return { status: "completed", generatedImageUrl };
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message || "Image generation failed";
    await News.updateOne({ _id: article._id }, { $set: { generatedImageStatus: "failed", generatedImageError: String(message).slice(0, 500) } });
    console.error("AI cover failed:", article.title, "-", message);
    return { status: "failed" };
  }
};
