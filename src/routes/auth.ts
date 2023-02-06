import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { User } from "@prisma/client";
import { GoogleAuth, GithubAuth } from "../controllers/auth.js";

type createUser = Omit<User, "id">;

const router = express.Router();

router.get("/auth/url/google", (_, res) => {
  res.status(200).json({ url: process.env.GOOGLE_LOGIN_URL });
});

router.get("/auth/url/github", (_, res) => {
  res.status(200).json({ url: process.env.GITHUB_LOGIN_URL });
});

router.post("/auth/login/google", async (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).json({ message: "No code provided" });
  const googleAuth = new GoogleAuth(res, code);
  await googleAuth.login();
});

router.post("/auth/login/github", async (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).json({ message: "No code provided" });
  const githubAuth = new GithubAuth(res, code);
  await githubAuth.login();
});

export default router;
