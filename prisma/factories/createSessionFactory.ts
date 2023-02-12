import db from "../../lib/database.js";
import dotenv from "dotenv";
dotenv.config();

async function createSession(
  userId: number,
  createdAt: Date = new Date(),
  expiresAt: Date = new Date(
    new Date().getTime() + Number(process.env.SESSION_EXPIRES_IN)
  ),
  sessionToken: string = "token"
) {
  return await db.session.create({
    data: {
      userId,
      createdAt,
      expiresAt,
      sessionToken,
    },
  });
}

export default createSession;
