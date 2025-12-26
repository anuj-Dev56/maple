import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import register, { getMe, googleAuthCnt, signout } from "../controller/auth.cnt.js";
import authMiddleware from "../middleware/middleware.js";

const route = express.Router();

const authId = crypto.randomUUID() + "_authuser";

async function genrateToken(t) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(t, salt);
}

route.post("/register", register);
route.post("/google", googleAuthCnt);
route.get("/me", authMiddleware, getMe);
route.get("/signout", signout)

export default route;
