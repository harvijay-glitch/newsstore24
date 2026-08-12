import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) => jwt.sign(
  { role: user.role },
  process.env.JWT_SECRET,
  { subject: user._id.toString(), expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

export const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email }).select("+passwordHash");
    const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) return res.status(401).json({ success: false, message: "Invalid email or password." });

    res.json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    res.status(500).json({ success: false, message: "Login could not be completed." });
  }
};

export const getCurrentUser = (req, res) => res.json({ success: true, user: publicUser(req.user) });
