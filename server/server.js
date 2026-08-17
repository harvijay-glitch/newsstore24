import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
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
app.use(express.json());

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

// Check frequently, while the persisted import gate enforces one article every
// 90 minutes and a maximum of ten articles per processing day.
const scheduledCategories = ["general", "world", "business", "technology", "sports", "crypto", "stock"];
let scheduledCategoryIndex = 0;

cron.schedule("*/5 * * * *", () => {
  const category = scheduledCategories[scheduledCategoryIndex % scheduledCategories.length];
  scheduledCategoryIndex += 1;
  console.log(`📰 Checking scheduled ${category} news update...`);
  refreshAllNews(category).catch((error) => console.error("Scheduled news refresh failed:", error.message));
}, {
  timezone: process.env.NEWS_DAILY_TIMEZONE || "Asia/Kolkata",
});

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
    refreshAllNews("general").catch((error) => console.error("Startup news refresh failed:", error.message));
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
