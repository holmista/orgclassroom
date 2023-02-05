import express from "express";
import dotenv from "dotenv";
dotenv.config();
import googleClient from "../configs/googleClient.js";
import githubClient from "../configs/githubClient.js";

const router = express.Router();

router.get("/auth/url/google", (_, res) => {
  res.status(200).json({ url: process.env.GOOGLE_LOGIN_URL });
});

router.get("/auth/url/github", (_, res) => {
  res.status(200).json({ url: process.env.GITHUB_LOGIN_URL });
});

router.post("/auth/login/google", async (req, res) => {
  try {
    const tokens = await googleClient.getTokens(req.body.code);
    if (!tokens) throw new Error("Something went wrong");
    const user = await googleClient.getUser(
      tokens.access_token,
      tokens.id_token
    );
    if (!user) throw new Error("Something went wrong");
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/auth/login/github", async (req, res) => {
  try {
    const tokens = await githubClient.getTokens(req.body.code);
    if (!tokens) throw new Error("Something went wrong");
    const user = await githubClient.getUser(tokens.access_token);
    if (!user) throw new Error("Something went wrong");
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
