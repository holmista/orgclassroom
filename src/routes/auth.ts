import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { loginWithGithub, loginWithGoogle } from "../controllers/auth.js";

const router = express.Router();

router.get("/auth/url/google", (_, res) => {
  res.status(200).json({ url: process.env.GOOGLE_LOGIN_URL });
});

router.get("/auth/url/github", (_, res) => {
  res.status(200).json({ url: process.env.GITHUB_LOGIN_URL });
});

router.post("/auth/login/google", (req, res) => {
  loginWithGoogle(req, res);
});

router.post("/auth/login/github", (req, res) => {
  loginWithGithub(req, res);
});

export default router;
