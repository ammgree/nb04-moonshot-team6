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
};
