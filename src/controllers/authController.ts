import type express from "express";
import SocialAuth from "../../lib/socialAuth.js";
import type SocialClient from "../../lib/socialClient.js";
import GoogleClient from "../../lib/social-clients/googleClient.js";
import GithubClient from "../../lib/social-clients/githubClient.js";
import dotenv from "dotenv";
dotenv.config();

const googleAuth = new SocialAuth(GoogleClient.getInstance());
const githubAuth = new SocialAuth(GithubClient.getInstance());

async function loginWithGoogle(req: express.Request, res: express.Response, client: SocialClient) {
  try {
    const code = req.body.code as string;
    if (!code) return res.status(400).json({ message: "No code provided" });
    const sessionToken = await googleAuth.login(code);
    res.status(200).cookie("token", sessionToken, SocialAuth.cookieOptions).send();
    res.send();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

async function loginWithGithub(req: express.Request, res: express.Response, client: SocialClient) {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ message: "No code provided" });
    const sessionToken = await githubAuth.login(code);
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
    res
      .status(200)
      .cookie("token", "", {
        domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0
      } as express.CookieOptions)
      .end();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export { loginWithGithub, loginWithGoogle, logout };
