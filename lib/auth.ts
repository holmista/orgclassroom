import express from "express";
import { User } from "@prisma/client";
import db from "./database.js";
import Session from "./session.js";

type createUser = Omit<User, "id">;

abstract class Auth {
  res: express.Response;
  code: string;
  constructor(res: express.Response, code: string) {
    this.res = res;
    this.code = code;
  }
  abstract login(): Promise<void>;

  async createUser(user: createUser) {
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

  async sendAuthCookie(token: string) {
    this.res
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
  }
}

export default Auth;
