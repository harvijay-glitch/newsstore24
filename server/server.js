import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import newsRoutes from "./routes/newsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import { refreshAllNews } from "./services/newsService.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PUBLIC_SITE_URL,
  "https://newsstore24.com",
  "https://www.newsstore24.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));

app.use("/api/news", newsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/translate", translationRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 NewsStore24 API Running Successfully",
  });
});

// Import one category every 90 minutes. The persisted database gate remains the
// final guard when Render restarts or multiple instances overlap briefly.
const scheduledCategories = ["general", "world", "business", "technology", "sports", "crypto", "stock"];
let scheduledCategoryIndex = 0;

const runScheduledNewsRefresh = () => {
  const category = scheduledCategories[scheduledCategoryIndex % scheduledCategories.length];
  scheduledCategoryIndex += 1;
  console.log(`📰 Checking scheduled ${category} news update...`);
  refreshAllNews(category).catch((error) => console.error("Scheduled news refresh failed:", error.message));
};

const NEWS_REFRESH_INTERVAL_MS = 90 * 60 * 1000;

const PORT = process.env.PORT || 5000;

const ensureAdminAccount = async () => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const name = String(process.env.ADMIN_NAME || "INKL Administrator").trim();

  if (!email || !password) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD are not set; skipping admin bootstrap.");
    return;
  }
  if (password.length < 12) {
    console.warn("ADMIN_PASSWORD must be at least 12 characters; skipping admin bootstrap.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, passwordHash, role: "admin" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account is ready for ${user.email}.`);
};

const startServer = async () => {
  await connectDB();
  await ensureAdminAccount();

  app.listen(PORT, () => {
    console.log(`🚀 Server Running on Port ${PORT}`);
    runScheduledNewsRefresh();
    setInterval(runScheduledNewsRefresh, NEWS_REFRESH_INTERVAL_MS);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
