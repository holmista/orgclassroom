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

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubject);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
