import * as service from "../services/project.service.js";
import { AppError, getErrorMessage } from "../utils/error.js";
import type { Request, Response } from "express";

// 프로젝트 생성
export const createProjectController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);

    const project = await service.createProject(userId, req.body);
    res.status(201).json(project);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
};

// 프로젝트 목록 조회
export const getUserProjectsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = Number(req.user?.id);

    const projects = await service.getUserProjects({
      userId,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      orderBy: req.query.order_by as "created_at" | "name",
      order: req.query.order as "asc" | "desc",
    });
    res.status(200).json(projects);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
};
// 프로젝트 상세 조회
export const getProjectByIdController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = Number(req.params.projectId);

    const project = await service.getProjectById(userId, projectId);

    res.status(200).json(project);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
};

// 프로젝트 수정
export const updateProjectController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = Number(req.params.projectId);
    const project = await service.updateProject(userId, projectId, req.body);
    res.status(200).json(project);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
};

// 프로젝트 삭제
export const deleteProjectController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const projectId = Number(req.params.projectId);
    await service.deleteProject(userId, projectId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
};
