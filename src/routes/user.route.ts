import express from 'express';
import UserService from '../services/user.service.js';
import auth from '../middlewares/auth.middleware.js';
import controller from '../controllers/project.controller.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

// 회원가입 라우터
router
  .route('/auth/register')
  .post(userController.createUserController);

// 유저 조회, 수정 라우터
router
  .route('/users/me')
  .get(auth.verifyAccessToken, UserService.getUser)
  .patch(auth.verifyAccessToken, UserService.updateUser);

// 프로젝트 조회 라우터
router
  .route('/users/me/projects')
  .get(auth.verifyAccessToken, controller.getUserProjectsController);

export default router;