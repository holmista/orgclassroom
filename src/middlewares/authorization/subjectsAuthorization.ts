import { Request, Response, NextFunction } from "express";
import db from "../../../lib/database.js";
import { User } from "@prisma/client";

export default async function authorizeOperationsSubject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as User;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
  let subject = await db.subject.findUnique({
    where: { id },
  });
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  if (subject.userId !== user.id)
    return res.status(403).json({ message: "Forbidden" });
  next();
}
