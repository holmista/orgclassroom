import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  loginWithGithub,
  loginWithGoogle,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/url/google", (_, res) => {
  res.status(200).json({ url: process.env.GOOGLE_LOGIN_URL });
});

router.get("/url/github", (_, res) => {
  res.status(200).json({ url: process.env.GITHUB_LOGIN_URL });
});

router.post("/login/google", (req, res) => {
  loginWithGoogle(req, res);
});

router.post("/login/github", (req, res) => {
  loginWithGithub(req, res);
});

router.get("/logout", (req, res) => {
  logout(req, res);
});

export default router;
