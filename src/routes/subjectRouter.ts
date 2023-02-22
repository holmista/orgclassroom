import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} from "../controllers/subjectController.js";
import authorizeOperationsSubject from "../middlewares/authorization/subjectsAuthorization.js";

import {
  validateCreateSubject,
  validateUpdateSubject
} from "../middlewares/data-validation/subjects/subjectValidation.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id", authorizeOperationsSubject, getSubject);
router.post("/", validateCreateSubject, createSubject);
router.put("/:id", validateUpdateSubject, authorizeOperationsSubject, updateSubject);
router.delete("/:id", authorizeOperationsSubject, deleteSubject);

export default router;
