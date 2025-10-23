import type { Request, Response, NextFunction } from "express";
import { SubtaskService } from "../services/subtask.service.js";
import { AppError, getErrorMessage } from "../utils/error.js";

export const SubtaskController = {
  createSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.token?.userId);
      const taskId = Number(req.params.taskId);
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ message: "title은 필수입니다." });
      }

      const subtask = await SubtaskService.createSubtask(userId, taskId, title);
      return res.status(201).json(subtask);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  getSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.token?.userId);
      const taskId = Number(req.params.taskId);
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);

      const subtasks = await SubtaskService.getSubtasks(
        userId,
        taskId,
        page,
        limit
      );

      return res.status(200).json(subtasks);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  getSubtaskId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.token?.userId);
      const subtaskId = Number(req.params.subtaskId);

      const subtask = await SubtaskService.getSubtaskId(userId, subtaskId);

      return res.status(200).json(subtask);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  updateSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.token?.userId);
      const subtaskId = Number(req.params.subtaskId);

      const { title, status } = req.body;

      const updateSubtask = await SubtaskService.updateSubtask(
        userId,
        subtaskId,
        title,
        status
      );

      return res.status(200).json(updateSubtask);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        res.status(500).json({ message: getErrorMessage(err) });
      }
    }
  },

  deleteSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.token?.userId);
      const subtaskId = Number(req.params.subtaskId);

      await SubtaskService.deleteSubtask(userId, subtaskId);

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
