import { type Request, type Response } from "express";
import { type User } from "@prisma/client";
import FileStorageManager from "../../lib/fileStorageManager.js";

const fileStorageManager = FileStorageManager.getInstance();

const mimeTypes = new Map<string, string>();
mimeTypes.set("png", "image/png");
mimeTypes.set("jpg", "image/jpeg");
mimeTypes.set("jpeg", "image/jpeg");
mimeTypes.set("pdf", "application/pdf");

export default async function getFile(req: Request, res: Response) {
  const user = req.user as User;
  const { subjectId, noteId, fileName } = req.params;
  const extension = fileName.split(".").pop();
  if (!extension) return res.status(400).json({ message: "invalid file extension" });
  if (!mimeTypes.get(extension)) return res.status(400).json({ message: "invalid file extension" });
  const file = (await fileStorageManager.readFile(user.id, parseInt(subjectId), parseInt(noteId), fileName)) as Buffer;
  res.setHeader("Content-Type", mimeTypes.get(extension) as string);
  res.setHeader("content-length", file.length);
  res.status(200).send(file);
}
