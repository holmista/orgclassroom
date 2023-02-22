import { Request, Response, NextFunction } from "express";
import { CreateNoteSchema, updateNoteSchema } from "./schemas.js";

export const validateCreateNote = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateNoteSchema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(422).json({ errors: err.format() });
  }
};

export const validateUpdateNote = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    updateNoteSchema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(422).json({ errors: err.format() });
  }
};
