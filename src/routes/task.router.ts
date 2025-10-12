import express from "express";
import { TaskController } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/:projectId/tasks", TaskController.createTask);
router.get("/:projectId/tasks", TaskController.getTasks);
router.get("/:taskId", TaskController.getTaskId);

export default router;
