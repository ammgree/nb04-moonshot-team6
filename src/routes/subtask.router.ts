import { SubtaskController } from "../controllers/subtask.controller.js";
import auth from "../middlewares/auth.middleware.js";
import express from "express";

const router = express.Router();

router.get(
  "/:subtaskId",
  auth.verifyAccessToken,
  SubtaskController.getSubtaskId
);
router.patch(
  "/:subtaskId",
  auth.verifyAccessToken,
  SubtaskController.updateSubtask
);
router.delete(
  "/:subtaskId",
  auth.verifyAccessToken,
  SubtaskController.deleteSubtask
);

export default router;
