import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const name = String(process.env.ADMIN_NAME || "INKL Administrator").trim();

if (!process.env.MONGO_URI || !email || !password) {
  console.error("Set MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env before creating an admin.");
  process.exit(1);
}

if (password.length < 12) {
  console.error("ADMIN_PASSWORD must contain at least 12 characters.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, passwordHash, role: "admin" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account is ready for ${user.email}.`);
} catch (error) {
  console.error("Admin creation failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
