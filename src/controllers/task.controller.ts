import type { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";
import { AppError, getErrorMessage } from "../utils/error.js";

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
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.projectId);
      const userId = Number(req.token?.userId);

      const tasks = await TaskService.getTasks(projectId, userId, req.query);

      res.status(200).json(tasks);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  getTaskId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.token?.userId);

      const task = await TaskService.getTaskId(taskId, userId);

      res.status(200).json(task);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  updatedTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.token?.userId);

      const updateTask = await TaskService.updateTask(req.body, taskId, userId);

      res.status(200).json(updateTask);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.token?.userId);

      await TaskService.deleteTask(taskId, userId);

      res.status(204).send();
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },
};
