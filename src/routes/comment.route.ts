import { createComment, deleteComment, getComment, gettaskcomment, patchComment } from '../controllers/comment.controller.js';
import express from 'express';
import { authMiddlewere } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/tasks/:taskId/comments", authMiddlewere, createComment);
router.get("/tasks/:taskId/comments", authMiddlewere, gettaskcomment);
router.get("/comments/:commentId", authMiddlewere, getComment);
router.patch("/comments/:commentId", authMiddlewere, patchComment);
router.delete("/comments/:commentId", authMiddlewere, deleteComment);

export default router;