import { Router } from "express";
import filesAuthorization from "../middlewares/authorization/filesAuthorization.js";
import getFile from "../controllers/fileController.js";

const router = Router();

router.get("/:userId/:subjectId/:noteId/:fileName", filesAuthorization, getFile);

export default router;
