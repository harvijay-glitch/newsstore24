import mongoose from "mongoose";

// A persisted, global quota makes the daily import limit survive restarts and
// prevents concurrent HTTP requests/cron runs from exceeding it.
const dailyNewsProcessingSchema = new mongoose.Schema(
  {
    processingDate: { type: String, required: true, unique: true, index: true },
    importedCount: { type: Number, default: 0, min: 0 },
    aiCompletedCount: { type: Number, default: 0, min: 0 },
    aiFailedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("DailyNewsProcessing", dailyNewsProcessingSchema);
