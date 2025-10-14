import express from 'express';
import UserService from '../services/user.service.js';
import auth from '../middlewares/auth.middleware.js';
import controller from '../controllers/project.controller.js';

const router = express.Router();

// 회원가입 라우터
router
  .route('/auth/register')
  .post(UserService.createUsers);

// 유저 조회 라우터
router
  .route('/users/me')
  .get(auth.verifyAccessToken, UserService.getUser);

// 프로젝트 조회 라우터
router
  .route('/users/me/projects')
  .get(auth.verifyAccessToken, controller.getUserProjectsController);

export default router;