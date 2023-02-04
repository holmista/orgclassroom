import express from "express";

const router = express.Router();

router.get("/auth/google-url", (_, res) => {
  res.status(200).json({ url: process.env.GOOGLE_LOGIN_URL });
});

router.post("/auth/google-login", async (req, res) => {});

export default router;
