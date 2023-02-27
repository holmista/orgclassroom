import { type Request, type Response } from "express";
import db from "../../lib/database.js";
import { type CreateSubject } from "../middlewares/data-validation/subjects/schemas.js";
import { type User, type Subject, type Note } from "@prisma/client";
import StaticFileManager from "../../lib/StaticFileManager.js";
import FileStorageManager from "../../lib/fileStorageManager.js";

const staticFileManager = StaticFileManager.getInstance();
const fileStorageManager = FileStorageManager.getInstance();

interface INoteWithFiles extends Note {
  files: Array<Buffer | undefined>;
}

interface ISubjectWithNotes extends Subject {
  Note: INoteWithFiles[];
}

export async function getAllSubjects(req: Request, res: Response) {
  const user = req.user as User;
  const subjects = await db.subject.findMany({
    where: { userId: user.id }
  });
  res.status(200).json({ subjects });
}

export async function getSubject(req: Request, res: Response) {
  const subject = (await db.subject.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      Note: true
    }
  })) as ISubjectWithNotes;
  for (let i = 0; i < subject.Note.length; i++) {
    const noteFiles = await staticFileManager.readFiles(subject.userId, subject.id, subject.Note[i].id);
    subject.Note[i].files = noteFiles;
  }
  res.status(200).json({ subject });
}

export async function createSubject(req: Request, res: Response) {
  const user = req.user as User;
  const { startTime, endTime, title } = req.body as CreateSubject;
  const subject = await db.subject.create({
    data: {
      userId: user.id,
      startTime,
      endTime,
      title
    }
  });
  await fileStorageManager.createSubjectFolder(user.id, subject.id);
  res.status(201).json({ subject });
}

export async function updateSubject(req: Request, res: Response) {
  const subject = await db.subject.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.status(200).json({ subject });
}

export async function deleteSubject(req: Request, res: Response) {
  const user = req.user as User;
  await db.subject.delete({
    where: { id: parseInt(req.params.id) }
  });
  await fileStorageManager.deleteSubjectFolder(user.id, parseInt(req.params.id));
  res.status(204).end();
}
