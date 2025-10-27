import express from "express";
import passport from "../configs/passport.js";
import {
  createCommentController,
  deleteCommentController,
  getCommentByIdController,
  getTaskCommentsController,
  updateCommentController,
} from "../controllers/comment.controller.js";

const router = express.Router();

// 댓글 생성
router.post(
  "/tasks/:taskId/comments",
  passport.authenticate("jwt", { session: false }),
  createCommentController
);

// 특정 할 일에 달린 댓글 목록 조회
router.get(
  "/tasks/:taskId/comments",
  passport.authenticate("jwt", { session: false }),
  getTaskCommentsController
);

// 댓글 단일 조회
router.get(
  "/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  getCommentByIdController
);

// 댓글 수정
router.patch(
  "/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  updateCommentController
);

// 댓글 삭제
router.delete(
  "/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  deleteCommentController
);

export default router;