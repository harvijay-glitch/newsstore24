import express from "express";
import { askAboutNews, getNewsSummary, getSummary } from "../controllers/aiController.js";

const router = express.Router();

router.post("/summary", getSummary);
router.get("/summary/:id", getNewsSummary);
router.post("/chat", askAboutNews);

export default router;
