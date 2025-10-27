import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import passport from "../configs/passport.js"

const router = express.Router();

// 프로젝트 조회 라우터
router
  .route('/users/me/tasks')
  .get(passport.authenticate("jwt", { session: false }),
    dashboardController.getDashboardController)

export default router;