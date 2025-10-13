import express from "express";
import { TaskController } from "../controllers/task.controller.js";
import subtaskRouter from "./subtask.router.js";

const router = express.Router();

router.post("/:projectId/tasks", TaskController.createTask);
router.get("/:projectId/tasks", TaskController.getTasks);
router.get("/:taskId", TaskController.getTaskId);
router.patch("/:taskId", TaskController.updatedTask);
router.delete("/:taskId", TaskController.deleteTask);

router.use("/:taskId", subtaskRouter);

export default router;
