import service from "../services/dashboard.service.js";
import type { Request, Response } from "express";

export const getDashboardController = async (
  req: Request,
  res: Response
) => {
    const userId = Number(req.user?.id);
    const { from, to, project_id, status, assignee_id, keyword }
     = req.query as {
      from?: string;
      to?: string;
      project_id?: string;
      status?: string;
      assignee_id?: number;
      keyword?: string;
    };
    const dashboardData = await service.getDashboardData(
      userId, from, to, project_id, status, assignee_id, keyword
    );
    res.status(200).json(dashboardData);
};

export default {
  getDashboardController,
};