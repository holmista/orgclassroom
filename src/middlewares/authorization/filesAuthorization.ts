import { type Request, type Response, NextFunction } from "express";
import { type User } from "@prisma/client";
import db from "../../../lib/database.js";

export async function authorizeGetNoteFile(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User;
  const { userId, subjectId, noteId } = req.params;
  if (isNaN(parseInt(subjectId)) || isNaN(parseInt(noteId)))
    return res.status(400).json({ message: "Invalid file path" });
  const note = await db.note.findUnique({
    where: { id: parseInt(noteId) },
    include: { subject: true }
  });
  if (!note) return res.status(404).json({ message: "Invalid file path" });
  if (note.subject.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
  next();
}

export async function authorizeCreateDeleteNoteFile(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User;
  const { subjectId, noteId } = req.params;
  if (isNaN(parseInt(subjectId)) || isNaN(parseInt(noteId)))
    return res.status(400).json({ message: "Invalid file path" });
  const note = await db.note.findUnique({
    where: { id: parseInt(noteId) },
    include: { subject: true }
  });
  if (!note) return res.status(404).json({ message: "Invalid file path" });
  if (note.subject.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
  next();
}
