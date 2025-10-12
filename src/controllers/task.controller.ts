import type { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";

export const TaskController = {
  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await TaskService.getTasks(req.query);

      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },

  getTaskId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);

      const task = await TaskService.getTaskId(taskId);

      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },
};
