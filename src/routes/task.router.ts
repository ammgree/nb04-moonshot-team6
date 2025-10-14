import express from "express";
import { TaskController } from "../controllers/task.controller.js";
import { SubtaskController } from "../controllers/subtask.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/:projectId/tasks",
  auth.verifyAccessToken,
  TaskController.createTask
);
router.get(
  "/:projectId/tasks",
  auth.verifyAccessToken,
  TaskController.getTasks
);

router.get("/:taskId", auth.verifyAccessToken, TaskController.getTaskId);
router.patch("/:taskId", auth.verifyAccessToken, TaskController.updatedTask);
router.delete("/:taskId", auth.verifyAccessToken, TaskController.deleteTask);

router.post(
  "/:taskId/subtasks",
  auth.verifyAccessToken,
  SubtaskController.createSubtask
);
router.get(
  "/:taskId/subtasks",
  auth.verifyAccessToken,
  SubtaskController.getSubtask
);

export default router;
