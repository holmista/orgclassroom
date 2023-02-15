import express from "express";
import dotenv from "dotenv";
dotenv.config();
import GoogleClient from "../configs/googleClient.js";
import GithubClient from "../configs/githubClient.js";
import {
  loginWithGithub,
  loginWithGoogle,
  logout,
} from "../controllers/authController.js";

const router = express.Router();
const googleClient = GoogleClient.getInstance();
const githubClient = GithubClient.getInstance();

router.get("/url/google", (_, res) => {
  res.status(200).json({ url: process.env.GOOGLE_LOGIN_URL });
});

router.get("/url/github", (_, res) => {
  res.status(200).json({ url: process.env.GITHUB_LOGIN_URL });
});

router.post("/login/google", (req, res) => {
  loginWithGoogle(req, res, googleClient);
});

router.post("/login/github", (req, res) => {
  loginWithGithub(req, res, githubClient);
});

router.get("/logout", (req, res) => {
  logout(req, res);
});

export default router;
