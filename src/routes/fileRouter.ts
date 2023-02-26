import { Router } from "express";
import filesAuthorization from "../middlewares/authorization/filesAuthorization.js";
import { getFile, createNoteFile, deleteNoteFile } from "../controllers/fileController.js";

const router = Router();

router.get("/:userId/:subjectId/:noteId/:fileName", filesAuthorization, getFile);
router.post("/:subjectId/:noteId", filesAuthorization, createNoteFile);
router.delete("/:subjectId/:noteId/:imageName", filesAuthorization, deleteNoteFile);

export default router;
