import type express from "express";
import SocialAuth from "../../lib/socialAuth.js";
import type SocialClient from "../../lib/socialClient.js";
import GoogleClient from "../configs/googleClient.js";
import GithubClient from "../configs/githubClient.js";
import dotenv from "dotenv";
dotenv.config();

async function loginWithGoogle(req: express.Request, res: express.Response, client: SocialClient) {
  try {
    const code = req.body.code as string;
    if (!code) return res.status(400).json({ message: "No code provided" });
    const socialAuth = new SocialAuth(code, GoogleClient.getInstance());
    const sessionToken = await socialAuth.login();
    res.status(200).cookie("token", sessionToken, SocialAuth.cookieOptions).end();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

async function loginWithGithub(req: express.Request, res: express.Response, client: SocialClient) {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ message: "No code provided" });
    const socialAuth = new SocialAuth(code, GithubClient.getInstance());
    const sessionToken = await socialAuth.login();
    res.status(200).cookie("token", sessionToken, SocialAuth.cookieOptions).end();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

async function logout(req: express.Request, res: express.Response) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token provided" });
    await SocialAuth.logout(token);
    res.status(200).clearCookie("token", SocialAuth.cookieOptions).end();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export { loginWithGithub, loginWithGoogle, logout };
