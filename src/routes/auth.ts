import express from "express";
import dotenv from "dotenv";
dotenv.config();
import googleClient from "../configs/googleClient.js";
import githubClient from "../configs/githubClient.js";
import db from "../../lib/database.js";
import { User } from "@prisma/client";
import { randomBytes } from "node:crypto";

type createUser = Omit<User, "id">;

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
    const userData = await googleClient.getUser(
      tokens.access_token,
      tokens.id_token
    );
    if (!userData) throw new Error("Something went wrong");
    const user = await crateUser({
      email: userData.email,
      name: userData.name,
      authProvider: "google",
      authProviderId: userData.id,
    });
    const sessionToken = await createSession(user);
    res
      .status(200)
      .cookie("access_token", sessionToken, {
        domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: process.env.SESSION_EXPIRES_IN as unknown as number,
      })
      .end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/auth/login/github", async (req, res) => {
  try {
    const tokens = await githubClient.getTokens(req.body.code);
    if (!tokens) throw new Error("Something went wrong");
    const userData = await githubClient.getUser(tokens.access_token);
    if (!userData) throw new Error("Something went wrong");
    const user = await crateUser({
      email: userData.primary_email,
      name: userData.login,
      authProvider: "github",
      authProviderId: String(userData.id),
    });
    const sessionToken = await createSession(user);
    res
      .status(200)
      .cookie("access_token", sessionToken, {
        domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: process.env.SESSION_EXPIRES_IN as unknown as number,
      })
      .end();
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

async function crateUser(user: createUser) {
  try {
    const userData = await db.user.findFirst({
      where: {
        authProviderId: user.authProviderId,
        authProvider: user.authProvider,
      },
    });
    if (!userData) {
      const newUser = await db.user.create({
        data: user,
      });
      return newUser;
    }
    return userData;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function createSession(user: User) {
  const expiresAt = new Date(
    new Date().getTime() + Number(process.env.SESSION_EXPIRES_IN)
  );
  try {
    const session = await db.session.findFirst({
      where: { userId: user.id },
    });
    if (session) {
      await db.session.update({
        where: { userId: session.userId },
        data: { expiresAt },
      });
      return session.sessionToken;
    }
    const newSession = await db.session.create({
      data: {
        userId: user.id,
        createdAt: new Date(),
        expiresAt,
        sessionToken: randomBytes(32).toString("hex"),
      },
    });
    return newSession.sessionToken;
  } catch (err) {
    throw new Error(err.message);
  }
}

export default router;
