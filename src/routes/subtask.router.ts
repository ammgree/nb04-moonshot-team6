import { SubtaskController } from "../controllers/subtask.controller.js";
import passport from "passport";
import express from "express";

const router = express.Router();

router.post(
  "/tasks/:taskId/subtasks",
  passport.authenticate("jwt", { session: false }),
  SubtaskController.createSubtask
);
router.get(
  "/tasks/:taskId/subtasks",
  passport.authenticate("jwt", { session: false }),
  SubtaskController.getSubtask
);

router.get(
  "/subtasks/:subtaskId",
  passport.authenticate("jwt", { session: false }),
  SubtaskController.getSubtaskId
);
router.patch(
  "/subtasks/:subtaskId",
  passport.authenticate("jwt", { session: false }),
  SubtaskController.updateSubtask
);
router.delete(
  "/subtasks/:subtaskId",
  passport.authenticate("jwt", { session: false }),
  SubtaskController.deleteSubtask
);

export default router;
