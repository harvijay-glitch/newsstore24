import express from "express";
import {
  fetchNews,
  searchNews,
  toggleBookmark,
  getBookmarkedNews,
  getRelatedNews,
  getNewsArticle,
  getGeneratedNewsImage,
  getAuthorArticles,
  getDailyBrief,
  getRecommendations,
  getAnalytics,
  getAdminPosts,
  getAdminPostById,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
  getAdminNews,
  createAdminNews,
  getAdminNewsById,
  updateAdminNews,
  deleteAdminNews,
  toggleFeaturedAdminNews,
} from "../controllers/newsController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// Admin Posts CMS
// =========================
router.get("/admin/posts", requireAuth, requireAdmin, getAdminPosts);
router.get("/admin/posts/:id", requireAuth, requireAdmin, getAdminPostById);
router.post("/admin/posts", requireAuth, requireAdmin, createAdminPost);
router.put("/admin/posts/:id", requireAuth, requireAdmin, updateAdminPost);
router.delete("/admin/posts/:id", requireAuth, requireAdmin, deleteAdminPost);

// =========================
// Admin News CMS
// =========================
router.get("/admin/news", requireAuth, requireAdmin, getAdminNews);
router.post("/admin/news", requireAuth, requireAdmin, createAdminNews);
router.get("/admin/news/:id", requireAuth, requireAdmin, getAdminNewsById);
router.put("/admin/news/:id", requireAuth, requireAdmin, updateAdminNews);
router.delete("/admin/news/:id", requireAuth, requireAdmin, deleteAdminNews);
router.patch("/admin/news/:id/featured", requireAuth, requireAdmin, toggleFeaturedAdminNews);

// =========================
// Latest News
// =========================
router.get("/", fetchNews);

// =========================
// Search News
// Example:
// /api/news/search?q=india
// =========================
router.get("/search", searchNews);

// =========================
// Saved News
// =========================
router.get("/saved", getBookmarkedNews);
router.get("/daily-brief", getDailyBrief);
router.get("/recommendations", getRecommendations);
router.get("/analytics", requireAuth, requireAdmin, getAnalytics);
router.get("/image/:fileId", getGeneratedNewsImage);
router.get("/:id/related", getRelatedNews);
router.get("/author/:name", getAuthorArticles);
router.get("/:id", getNewsArticle);

// =========================
// Toggle Bookmark
// =========================
router.patch("/bookmark/:id", toggleBookmark);

export default router;
