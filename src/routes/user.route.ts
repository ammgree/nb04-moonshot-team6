import express from 'express';
import userController from '../controllers/user.controller.js';
import passport from "passport"

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
  .get(passport.authenticate("jwt", { session: false }),
       userController.getUserController)
  .patch(passport.authenticate("jwt", { session: false }),
         userController.updateUserController);

export default router;