import express from "express";
import { TaskController } from "../controllers/task.controller.js";

const router = express.Router();

router.get("/:projectId/tasks", TaskController.getTasks);
router.get("/:taskId", TaskController.getTaskId);

export default router;
