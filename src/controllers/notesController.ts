import { Request, Response } from "express";
import db from "../../lib/database.js";

export async function getNote(req: Request, res: Response) {
  const note = await db.note.findUnique({
    where: { id: parseInt(req.params.noteId) },
  });
  res.status(200).json({ note });
}

export async function createNote(req: Request, res: Response) {
  const note = await db.note.create({
    data: req.body,
  });
  res.status(201).json({ note });
}

export async function updateNote(req: Request, res: Response) {
  const note = await db.note.update({
    where: { id: parseInt(req.params.noteId) },
    data: req.body,
  });
  res.status(200).json({ note });
}

export async function deleteNote(req: Request, res: Response) {
  await db.note.delete({
    where: { id: parseInt(req.params.noteId) },
  });
  res.status(204).end();
}
