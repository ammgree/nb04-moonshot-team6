import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import controller from '../controllers/project.controller.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

// 회원가입 라우터
router
  .route('/auth/register')
  .post(
    //upload.single('files'), 
    userController.createUserController);

// 유저 조회, 수정 라우터
router
  .route('/users/me')
  .get(auth.verifyAccessToken, userController.getUserController)
  .patch(auth.verifyAccessToken, userController.updateUserController);

// 프로젝트 조회 라우터
router
  .route('/users/me/projects')
  .get(auth.verifyAccessToken, controller.getUserProjectsController);

export default router;