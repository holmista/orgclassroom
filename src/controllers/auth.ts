import express from "express";
import Auth from "../../lib/auth.js";
import googleClient from "../configs/googleClient.js";
import githubClient from "../configs/githubClient.js";

class GoogleAuth extends Auth {
  constructor(res: express.Response, code: string) {
    super(res, code);
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
      super.sendAuthCookie(sessionToken);
    } catch (err) {
      this.res.status(400).json({ message: err.message });
    }
  }
}

class GithubAuth extends Auth {
  constructor(res: express.Response, code: string) {
    super(res, code);
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
      super.sendAuthCookie(sessionToken);
    } catch (err) {
      this.res.status(400).json({ message: err.message });
    }
  }
}

export { GoogleAuth, GithubAuth };
