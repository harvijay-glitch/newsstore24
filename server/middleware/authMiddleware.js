import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : "";
    if (!token) return res.status(401).json({ success: false, message: "Authentication is required." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("name email role");
    if (!user) return res.status(401).json({ success: false, message: "Your session is no longer valid." });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Your session is invalid or has expired." });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin access is required." });
  next();
};
