import { User } from "@prisma/client";
import db from "./database.js";
import Session from "./session.js";
import express from "express";
import SocialClient from "./socialClient.js";
import FileStorageManager from "./fileStorageManager.js";
import { type tokens } from "./socialClient.js";

const fileStorageManager = FileStorageManager.getInstance();

type createUser = Omit<User, "id">;

class SocialAuth {
  private code: string;
  private socialClient: SocialClient;
  static readonly cookieOptions: express.CookieOptions = {
    domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: Number(process.env.SESSION_EXPIRES_IN)
  };
  constructor(code: string, client: SocialClient) {
    this.code = code;
    this.socialClient = client;
  }
  async login() {
    try {
      const tokens = await this.socialClient.getTokens(this.code);
      if (!tokens) throw new Error("could not get user tokens");
      const userData = await this.socialClient.getUser(tokens);
      if (!userData) throw new Error("could not get user data");
      const user = await this.createUser(userData);
      await fileStorageManager.createUserFolder(user.id);
      const sessionToken = await this.createSession(user);
      return sessionToken;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async createUser(user: createUser) {
    try {
      if (!user) throw new Error("");
      const userData = await db.user.findFirst({
        where: {
          email: user.email
        }
      });
      if (!userData) {
        const newUser = await db.user.create({
          data: user
        });
        return newUser;
      }
      return userData;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async createSession(user: User) {
    try {
      const session = await db.session.findFirst({
        where: { userId: user.id }
      });
      if (session) {
        const token = await Session.extend(user.id);
        return token;
      }
      const token = await Session.create(user.id);
      return token;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  static async logout(token: string) {
    try {
      const session = await db.session.delete({
        where: { sessionToken: token }
      });
      return session;
    } catch (err: any) {
      throw new Error("invalid token");
    }
  }
}

export default SocialAuth;
