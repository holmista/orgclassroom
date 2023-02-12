import { Request, Response } from "express";
import db from "../../lib/database.js";
import { CreateSubject } from "../middlewares/data-validation/subjects/schemas.js";
import { User } from "@prisma/client";

export async function getAllSubjects(req: Request, res: Response) {
  const user = req.user as User;
  const subjects = await db.subject.findMany({
    where: { userId: user.id },
  });
  res.status(200).json({ subjects });
}

export async function getSubject(req: Request, res: Response) {
  const user = req.user as User;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
  const subject = await db.subject.findUnique({
    where: { id },
    include: {
      Note: true,
    },
  });
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  if (subject.userId !== user.id)
    return res.status(403).json({ message: "Forbidden" });
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
      title,
    },
  });
  res.status(201).json({ subject });
}

export async function updateSubject(req: Request, res: Response) {
  const user = req.user as User;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
  let subject = await db.subject.findUnique({
    where: { id },
  });
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  if (subject.userId !== user.id)
    return res.status(403).json({ message: "Forbidden" });
  subject = await db.subject.update({
    where: { id },
    data: req.body,
  });
  res.status(200).json({ subject });
}

export async function deleteSubject(req: Request, res: Response) {
  const user = req.user as User;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(404).json({ message: "Invalid id" });
  const subject = await db.subject.findUnique({
    where: { id },
  });
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  if (subject.userId !== user.id)
    return res.status(403).json({ message: "Forbidden" });
  await db.subject.delete({
    where: { id },
  });
  res.status(204).end();
}
