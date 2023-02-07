import db from "./database.js";
import dotenv from "dotenv";
dotenv.config();
import { randomUUID } from "node:crypto";

class Session {
  static async create(userId: number) {
    const newSession = await db.session.create({
      data: {
        userId: userId,
        createdAt: new Date(),
        expiresAt: new Date(
          new Date().getTime() + Number(process.env.SESSION_EXPIRES_IN)
        ),
        sessionToken: randomUUID(),
      },
    });
    return newSession.sessionToken;
  }

  static async extend(userId: number) {
    const updatedSession = await db.session.update({
      where: { userId: userId },
      data: {
        expiresAt: new Date(
          new Date().getTime() + Number(process.env.SESSION_EXPIRES_IN)
        ),
      },
    });
    return updatedSession.sessionToken;
  }
}

export default Session;
