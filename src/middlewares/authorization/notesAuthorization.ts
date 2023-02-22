import { Request, Response, NextFunction } from "express";
import db from "../../../lib/database.js";
import { User } from "@prisma/client";

export async function authorizeGetNote(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User;
  const noteId = parseInt(req.params.noteId);
  const subjectId = parseInt(req.params.subjectId);
  if (isNaN(noteId)) return res.status(400).json({ message: "Invalid note id" });
  if (isNaN(subjectId)) return res.status(400).json({ message: "Invalid subject id" });
  const note = await db.note.findUnique({
    where: { id: parseInt(req.params.noteId) },
    include: { subject: true }
  });
  if (!note) return res.status(404).json({ message: "Note not found" });
  if (note.subject.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
  next();
}

export async function authorizeCreateNote(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User;
  const subjectId = parseInt(req.body.subjectId);
  if (isNaN(subjectId)) return res.status(400).json({ message: "Invalid subject id" });
  const subject = await db.subject.findUnique({
    where: { id: parseInt(req.body.subjectId) }
  });
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  if (subject.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
  next();
}

export async function authorizeUpdateNote(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User;
  const noteId = parseInt(req.params.noteId);
  if (isNaN(noteId)) return res.status(400).json({ message: "Invalid note id" });
  const note = await db.note.findUnique({
    where: { id: noteId },
    include: { subject: true }
  });
  if (!note) return res.status(404).json({ message: "Note not found" });
  if (note.subject.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
  next();
}

export async function authorizeDeleteNote(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User;
  const noteId = parseInt(req.params.noteId);
  const subjectId = parseInt(req.params.subjectId);
  if (isNaN(noteId)) return res.status(400).json({ message: "Invalid note id" });
  if (isNaN(subjectId)) return res.status(400).json({ message: "Invalid subject id" });
  const note = await db.note.findUnique({
    where: { id: noteId },
    include: { subject: true }
  });
  if (!note) return res.status(404).json({ message: "Note not found" });
  if (note.subject.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
  next();
}
