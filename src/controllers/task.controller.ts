import type { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";

export const TaskController = {
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.projectId);
      const assigneeId = Number(req.token?.userId);

      const newTask = await TaskService.createTask(
        req.body,
        projectId,
        assigneeId
      );

      res.status(201).json(newTask);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "할 일 생성 실패" });
    }
  },

  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.projectId);
      const userId = Number(req.token?.userId);

      const tasks = await TaskService.getTasks(projectId, userId, req.query);

      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },

  getTaskId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.token?.userId);

      const task = await TaskService.getTaskId(taskId, userId);

      res.status(200).json(task);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },

  updatedTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.token?.userId);

      const updateTask = await TaskService.updateTask(req.body, taskId, userId);

      res.status(200).json(updateTask);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },

  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.token?.userId);

      await TaskService.deleteTask(taskId, userId);

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "잘못된 요청 형식" });
    }
  },
};
