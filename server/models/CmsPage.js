import mongoose from "mongoose";

const cmsPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

export default mongoose.model("CmsPage", cmsPageSchema);
