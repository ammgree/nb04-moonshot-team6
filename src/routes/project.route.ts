import express from "express";
import passport from "../configs/passport.js"
import {
  createProjectController,
  getUserProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller.js";

const router = express.Router();

// 프로젝트 상세 조회
router
  .route("/projects/:projectId")
  .get( 
    passport.authenticate("jwt", { session: false }),
    getProjectByIdController
  );

// 프로젝트 목록 조회
router
  .route("/users/me/projects")
  .get(
    passport.authenticate("jwt", { session: false }),
    getUserProjectsController
  );

router
  .route("/projects")
  .post(
    passport.authenticate("jwt", { session: false }),
    createProjectController
  );

router
  .route("/projects/:projectId")
  .patch(
    passport.authenticate("jwt", { session: false }),
    updateProjectController
  );

router
  .route("/projects/:projectId")
  .delete(
    passport.authenticate("jwt", { session: false }),
    deleteProjectController
  );

export default router;