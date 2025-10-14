import * as service from "../services/user.service.js";
import type { Request, Response } from "express";

export const getUserProjectsController = async (
  req: Request,
  res: Response
) => {
    const userId = Number(req.token?.userId);
    const sort = req.query.sort === "name" ? "name" : "latest";
    const projects = await service.getUserProjects(userId, sort);
    res.status(200).json(projects);
};

export default {
  getUserProjectsController,
};