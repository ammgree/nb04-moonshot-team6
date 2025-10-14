import { SubtaskController } from "../controllers/subtask.controller.js";
import express from "express";

const router = express.Router();

router.get("/:subtaskId", SubtaskController.getSubtaskId);

export default router;
