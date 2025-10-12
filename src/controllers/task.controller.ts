import type { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";

export const TaskController = {
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.projectId);

      const newTask = await TaskService.createTask(req.body, projectId);

      res.status(201).json(newTask);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "할 일 생성 실패" });
    }
  },

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

  updatedTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);

      const updateTask = await TaskService.updateTask(req.body, taskId);

      res.json(updateTask);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },
};
