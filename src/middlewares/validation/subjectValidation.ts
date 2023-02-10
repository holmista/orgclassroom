import { Request, Response, NextFunction } from "express";
import { CreateSubjectSchema, UpdateSubjectSchema } from "./schemas.js";
import isValidTime from "../../helpers/isValidTime.js";
import db from "../../../lib/database.js";

export const validateCreateSubject = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startTime, endTime } = CreateSubjectSchema.parse(req.body);
    if (!isValidTime(startTime) || !isValidTime(endTime))
      throw new Error("Invalid time");
    if (parseInt(startTime) >= parseInt(endTime)) {
      throw new Error("Start time must be before end time");
    }
    next();
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const validateUpdateSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startTime, endTime } = UpdateSubjectSchema.parse(req.body);
    if (startTime && !isValidTime(startTime))
      throw new Error("Invalid start time");
    if (endTime && !isValidTime(endTime)) throw new Error("Invalid end time");
    if (startTime && endTime && parseInt(startTime) >= parseInt(endTime)) {
      throw new Error("Start time must be before end time");
    }
    if (startTime && !endTime) {
      const subject = await db.subject.findUnique({
        where: { id: parseInt(req.params.id) },
      });
      if (!subject)
        return res.status(404).json({ message: "Subject not found" });
      if (parseInt(startTime) >= parseInt(subject.endTime)) {
        throw new Error("Start time must be before end time");
      }
    }
    if (endTime && !startTime) {
      const subject = await db.subject.findUnique({
        where: { id: parseInt(req.params.id) },
      });
      if (!subject)
        return res.status(404).json({ message: "Subject not found" });
      if (parseInt(subject.startTime) >= parseInt(endTime)) {
        throw new Error("Start time must be before end time");
      }
    }
    next();
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
