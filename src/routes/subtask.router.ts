import { SubtaskController } from "../controllers/subtask.controller.js";
import auth from "../middlewares/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post(
  "/tasks/:taskId/subtasks",
  auth.verifyAccessToken,
  SubtaskController.createSubtask
);
router.get(
  "/tasks/:taskId/subtasks",
  auth.verifyAccessToken,
  SubtaskController.getSubtask
);

router.get(
  "/subtasks/:subtaskId",
  auth.verifyAccessToken,
  SubtaskController.getSubtaskId
);
router.patch(
  "/subtasks/:subtaskId",
  auth.verifyAccessToken,
  SubtaskController.updateSubtask
);
router.delete(
  "/subtasks/:subtaskId",
  auth.verifyAccessToken,
  SubtaskController.deleteSubtask
);

export default router;
