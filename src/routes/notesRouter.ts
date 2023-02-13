import { Router } from "express";
import {
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";
import {
  authorizeGetNote,
  authorizeCreateNote,
  authorizeUpdateNote,
  authorizeDeleteNote,
} from "../middlewares/authorization/notesAuthorization.js";
import {
  validateCreateNote,
  validateUpdateNote,
} from "../middlewares/data-validation/notes/noteValidation.js";

const router = Router();

router.get("/:noteId", authorizeGetNote, getNote);
router.post("/:subjectId", authorizeCreateNote, validateCreateNote, createNote);
router.put("/:noteId", authorizeUpdateNote, validateUpdateNote, updateNote);
router.delete("/:noteId", authorizeDeleteNote, deleteNote);
