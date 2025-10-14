import express from "express";
import { TaskController } from "../controllers/task.controller.js";
import { SubtaskController } from "../controllers/subtask.controller.js";

const router = express.Router();

router.post("/:projectId/tasks", TaskController.createTask);
router.get("/:projectId/tasks", TaskController.getTasks);

router.get("/:taskId", TaskController.getTaskId);
router.patch("/:taskId", TaskController.updatedTask);
router.delete("/:taskId", TaskController.deleteTask);

router.post("/:taskId/subtasks", SubtaskController.createSubtask);
router.get("/:taskId/subtasks", SubtaskController.getSubtask);

export default router;
