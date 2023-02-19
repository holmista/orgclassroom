import { Request, Response } from "express";
import db from "../../lib/database.js";
import ImageManager from "../../lib/ImageManager.js";
import FileStorageManager from "../../lib/fileStorageManager.js";
import { User, Note } from "@prisma/client";
// import "express-async-errors";

const imageManager = ImageManager.getInstance();
const fileStorageManager = FileStorageManager.getInstance();

export async function getNote(req: Request, res: Response) {
  const user = req.user as User;
  const note = (await db.note.findUnique({
    where: { id: parseInt(req.params.noteId) },
  })) as Note;
  const noteFiles = await imageManager.readImages(
    user.id,
    note.subjectId,
    note.id
  );
  res.status(200).json({ note: { ...note, files: noteFiles } });
}

export async function createNote(req: Request, res: Response) {
  try {
    const user = req.user as User;
    const note = await db.note.create({
      data: {
        subjectId: parseInt(req.body.subjectId),
        title: req.body.title,
        content: req.body.content,
      },
    });
    await fileStorageManager.createNoteFolder(user.id, note.subjectId, note.id);
    if (req.files) {
      try {
        await imageManager.writeImages(
          user.id,
          note.subjectId,
          note.id,
          req.files as Express.Multer.File[]
        );
      } catch (e: any) {
        return res.status(422).json({ message: e.message });
      }
    }
    return res.status(201).json({ note });
  } catch (e: any) {
    if (e instanceof Error) res.status(422).json({ message: e.message });
    return res.status(500).json({ message: "unexpected error" });
  }
}

export async function updateNote(req: Request, res: Response) {
  const note = await db.note.update({
    where: { id: parseInt(req.params.noteId) },
    data: req.body,
  });
  res.status(200).json({ note });
}

export async function deleteNote(req: Request, res: Response) {
  const user = req.user as User;
  await db.note.delete({
    where: { id: parseInt(req.params.noteId) },
  });
  imageManager.deleteImages(
    user.id,
    parseInt(req.params.subjectId),
    parseInt(req.params.noteId)
  );
  res.status(204).end();
}

export async function createNoteImage(req: Request, res: Response) {
  const user = req.user as User;
  imageManager.writeImage(
    user.id,
    parseInt(req.params.subjectId),
    parseInt(req.params.noteId),
    req.file as Express.Multer.File
  );
  res.status(201).end();
}

export async function deleteNoteImage(req: Request, res: Response) {
  const user = req.user as User;
  imageManager.deleteImage(
    user.id,
    parseInt(req.params.subjectId),
    parseInt(req.params.noteId),
    req.params.imageName
  );
  res.status(204).end();
}
