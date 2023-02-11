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
    CreateSubjectSchema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(422).json({ errors: err.format() });
  }
};

export const validateUpdateSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startTime, endTime } = UpdateSubjectSchema.parse(req.body);
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
    return res.status(422).json({ message: err.message });
  }
};
