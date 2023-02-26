import { Router } from "express";
import {
  authorizeGetNoteFile,
  authorizeCreateDeleteNoteFile
} from "../middlewares/authorization/filesAuthorization.js";
import { getFile, createNoteFile, deleteNoteFile } from "../controllers/fileController.js";

const router = Router();

router.get("/:subjectId/:noteId/:fileName", authorizeGetNoteFile, getFile);
router.post("/:subjectId/:noteId", authorizeCreateDeleteNoteFile, createNoteFile);
router.delete("/:subjectId/:noteId/:fileName", authorizeCreateDeleteNoteFile, deleteNoteFile);

export default router;
