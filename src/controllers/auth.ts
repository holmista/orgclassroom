import express from "express";
import Auth from "../../lib/auth.js";
import googleClient from "../configs/googleClient.js";
import githubClient from "../configs/githubClient.js";
import dotenv from "dotenv";
dotenv.config();

class GoogleAuth extends Auth {
  constructor(code: string) {
    super(code);
  }
  async login() {
    try {
      const tokens = await googleClient.getTokens(this.code);
      if (!tokens) throw new Error("Something went wrong");
      const userData = await googleClient.getUser(
        tokens.access_token,
        tokens.id_token
      );
      if (!userData) throw new Error("Something went wrong");
      const user = await super.createUser({
        email: userData.email,
        name: userData.name,
        authProvider: "google",
        authProviderId: userData.id,
      });
      const sessionToken = await super.createSession(user);
      return sessionToken;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

class GithubAuth extends Auth {
  constructor(code: string) {
    super(code);
  }
  async login() {
    try {
      const tokens = await githubClient.getTokens(this.code);
      if (!tokens) throw new Error("Something went wrong");
      const userData = await githubClient.getUser(tokens.access_token);
      if (!userData) throw new Error("Something went wrong");
      const user = await super.createUser({
        email: userData.primary_email,
        name: userData.login,
        authProvider: "github",
        authProviderId: String(userData.id),
      });
      const sessionToken = await super.createSession(user);
      return sessionToken;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

async function loginWithGoogle(req: express.Request, res: express.Response) {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ message: "No code provided" });
    const googleAuth = new GoogleAuth(code);
    const token = await googleAuth.login();
    res
      .status(200)
      .cookie("token", token, {
        domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: process.env.SESSION_EXPIRES_IN as unknown as number,
      })
      .end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function loginWithGithub(req: express.Request, res: express.Response) {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ message: "No code provided" });
    const googleAuth = new GoogleAuth(code);
    const token = await googleAuth.login();
    res
      .status(200)
      .cookie("token", token, {
        domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: process.env.SESSION_EXPIRES_IN as unknown as number,
      })
      .end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export { loginWithGithub, loginWithGoogle };
