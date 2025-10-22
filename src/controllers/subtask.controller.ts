import type { Request, Response, NextFunction } from "express";
import { SubtaskService } from "../services/subtask.service.js";

export const SubtaskController = {
  createSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ message: "title은 필수입니다." });
      }

      const subtask = await SubtaskService.createSubtask(taskId, title);
      return res.status(201).json(subtask);
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "서버 오류" });
    }
  },

  getSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.taskId);
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);

      const subtasks = await SubtaskService.getSubtasks(taskId, page, limit);

      return res.status(200).json(subtasks);
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "서버 오류" });
    }
  },

  getSubtaskId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subtaskId = Number(req.params.subtaskId);

      const subtask = await SubtaskService.getSubtaskId(subtaskId);

      return res.status(200).json(subtask);
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "서버 오류" });
    }
  },

  updateSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subtaskId = Number(req.params.subtaskId);

      const { title, status } = req.body;

      const updateSubtask = await SubtaskService.updateSubtask(
        subtaskId,
        title,
        status
      );

      return res.status(200).json(updateSubtask);
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "서버 오류" });
    }
  },

  deleteSubtask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subtaskId = Number(req.params.subtaskId);

      await SubtaskService.deleteSubtask(subtaskId);

      res.status(204).send();
    } catch (error) {
      console.error(error);

      res.status(500).json({ message: "서버 오류" });
    }
  },
};
