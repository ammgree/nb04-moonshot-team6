import express from "express";
import { TaskController } from "../controllers/task.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/projects/:projectId/tasks",
  auth.verifyAccessToken,
  TaskController.createTask
);
router.get(
  "/projects/:projectId/tasks",
  auth.verifyAccessToken,
  TaskController.getTasks
);

router.get("/tasks/:taskId", auth.verifyAccessToken, TaskController.getTaskId);
router.patch(
  "/tasks/:taskId",
  auth.verifyAccessToken,
  TaskController.updatedTask
);
router.delete(
  "/tasks/:taskId",
  auth.verifyAccessToken,
  TaskController.deleteTask
);

export default router;
