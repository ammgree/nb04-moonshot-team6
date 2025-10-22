import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import dashboardController from '../controllers/dashboard.controller.js';
import { get } from 'https';

const router = express.Router();

// 프로젝트 조회 라우터
router
  .route('/users/me/tasks')
  .get(auth.verifyAccessToken, dashboardController.getDashboardController)

export default router;