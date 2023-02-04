import { Request, Response, NextFunction } from "express";
import db from "../../lib/database.js";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // join user rigt here and ull have to do only 1 query for this entire thing
    // but, u probably wont need to find a user for every request so idk man
    const session = await db.session.findFirst({
      where: { sessionToken: token },
      include: { user: true },
    });
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}
