import { User } from "@prisma/client";
import db from "./database.js";
import Session from "./session.js";
import express from "express";

type createUser = Omit<User, "id">;

abstract class Auth {
  code: string;
  static cookieOptions: express.CookieOptions = {
    domain: process.env.FRONT_TOP_LEVEL_DOMAIN,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: Number(process.env.SESSION_EXPIRES_IN),
  };
  constructor(code: string) {
    this.code = code;
  }
  abstract login(): Promise<string>;

  async createUser(user: createUser) {
    try {
      const userData = await db.user.findFirst({
        where: {
          email: user.email,
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

  async createSession(user: User) {
    try {
      const session = await db.session.findFirst({
        where: { userId: user.id },
      });
      if (session) {
        const token = await Session.extend(user.id);
        return token;
      }
      const token = await Session.create(user.id);
      return token;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async logout(token: string) {
    try {
      const session = await db.session.delete({
        where: { sessionToken: token },
      });
      return session;
    } catch (err) {
      throw new Error("invalid token");
    }
  }
}

export default Auth;
