import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

import {
  validateCreateSubject,
  validateUpdateSubject,
} from "../middlewares/validation/subjectValidation.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubject);
router.post("/", validateCreateSubject, createSubject);
router.put("/:id", validateUpdateSubject, updateSubject);
router.delete("/:id", deleteSubject);

export default router;
