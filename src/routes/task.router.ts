import express from "express";
import { TaskController } from "../controllers/task.controller.js";
import passport from "../configs/passport.js";

const router = express.Router();

router.post(
  "/projects/:projectId/tasks",
  passport.authenticate("jwt", { session: false }),
  TaskController.createTask
);
router.get(
  "/projects/:projectId/tasks",
  passport.authenticate("jwt", { session: false }),
  TaskController.getTasks
);

router.get(
  "/tasks/:taskId",
  passport.authenticate("jwt", { session: false }),
  TaskController.getTaskId
);
router.patch(
  "/tasks/:taskId",
  passport.authenticate("jwt", { session: false }),
  TaskController.updatedTask
);
router.delete(
  "/tasks/:taskId",
  passport.authenticate("jwt", { session: false }),
  TaskController.deleteTask
);

export default router;
