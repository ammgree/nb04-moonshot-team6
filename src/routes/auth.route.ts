import express from 'express';
import controller from '../controllers/auth.controller.js';


const router = express.Router();

// 로그인 라우터
router
  .route('/auth/login')
  .post(controller.getUserLoginController);


export default router;