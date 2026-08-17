import mongoose from "mongoose";

const mediaAssetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    dataUrl: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("MediaAsset", mediaAssetSchema);
