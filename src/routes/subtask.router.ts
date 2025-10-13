import SubtaskController from "../controllers/subtask.controller.js";
import express from "express";

const subtaskRouter = express.Router({ mergeParams: true });

subtaskRouter.post("/subtasks", SubtaskController.createSubtask);

export default subtaskRouter;
