import { SubtaskController } from "../controllers/subtask.controller.js";
import express from "express";

const router = express.Router();

router.get("/:subtaskId", SubtaskController.getSubtaskId);
router.patch("/:subtaskId", SubtaskController.updateSubtask);
router.delete("/:subtaskId", SubtaskController.deleteSubtask);

export default router;
