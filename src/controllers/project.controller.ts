import service from "../services/user.service.js";
import type { Request, Response } from "express";

export const getUserProjectsController = async (
  req: Request,
  res: Response
) => {
    const userId = Number(req.user?.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const orderBy = req.query.order_by === "name" ? "name" : "created_at";
    const projects = await service.getUserProjects(userId, page, limit, orderBy);
    res.status(200).json(projects);
};

export default {
  getUserProjectsController,
};