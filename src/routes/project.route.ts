import express from "express";
// import passport from "../lib/passport/...";

import {
  createProjectController,
  getUserProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller.js";

const router = express.Router();

// 프로젝트 상세 조회
router.get("/projects/:projectId", getProjectByIdController);

// 프로젝트 목록 조회
router.get("/users/me/projects", getUserProjectsController);

router.post("/projects", createProjectController);

router.patch("/projects/:projectId", updateProjectController);

router.delete("/projects/:projectId", deleteProjectController);

export default router;
