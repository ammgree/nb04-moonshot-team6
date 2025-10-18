import { patchedComment, deletedComment, getedtaskComment, getedComment, createdComment } from "../services/comment.service.js"
import type { NextFunction, Request, Response } from "express"

// 할 일에 댓글 추가
export async function createComment(req: Request, res: Response, next: NextFunction): Promise <void> {
  try {
    const userId = req.user?.id;
    const taskId = Number(req.params.taskId);
    const { content } = req.body;

    const result = await createdComment(userId, taskId, content);

    res.status(201).json({
      message: "댓글 등록 성공",
      data: result
    })
  }
  catch (error: any) {
  next (error);
  }
}

// 할 일에 달린 댓글 조회
export async function gettaskcomment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const taskId = Number(req.params.taskId);
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
      
    const result = await getedtaskComment(userId!, taskId!, page, limit);

    res.status(200).json({
      message: "할 일에 달린 댓글 조회 성공",
      data: result
    })
  }
  catch (error: any) {
  next (error);
  }
}

// 댓글 조회
export async function getComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const taskId = Number(req.params.taskId);

    if (!userId) {
      res.status(401).json({ message: "로그인이 필요합니다" });
      return;
    }

     if (!taskId || isNaN(taskId)) {
      res.status(400).json({ message: "유효하지 않은 taskId입니다" });
      return;
    }
    const result = await getedComment(userId!, taskId!);

    res.status(200).json({
      message: "댓글 조회 성공",
      data: result
    })
  }
  catch (error: any) {
  next (error);
  }
}

// 댓글 수정
export async function patchComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const taskId = Number(req.params.taskId);
    const commentId = Number(req.params.commentId);
    const { content } = req.body;

    const result = await patchedComment(userId!, commentId!, taskId!, content);

    res.status(200).json({
      message: "댓글 수정 성공",
      data: result
    })
  }
  catch (error: any) {
  next (error);
  }
}

// 댓글 삭제
export async function deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const taskId = Number(req.params.taskId)
    const commentId = Number(req.params.commentId);

    await deletedComment(userId!, taskId!, commentId!);
  
    res.status(204).send();
  }
  catch (error: any) {
  next (error);
  }
}