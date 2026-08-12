import express from "express";
import { translate } from "../controllers/translationController.js";

const router = express.Router();
router.post("/", translate);

export default router;
