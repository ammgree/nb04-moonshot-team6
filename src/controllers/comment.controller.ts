import * as service from "../services/comment.service.js";
import { AppError, getErrorMessage } from "../utils/error.js";
import type { Request, Response } from "express";

/**
 * 댓글 생성
 */
export const createCommentController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const taskId = Number(req.params.taskId);
    const { content } = req.body;

    const comment = await service.createComment(userId, taskId, content);
    res.status(201).json({ message: "댓글 등록 성공", data: comment });
  } catch (err) {
    if (err instanceof AppError) res.status(err.statusCode).json({ message: err.message });
    else res.status(500).json({ message: getErrorMessage(err) });
  }
};

// -------------------------
// 특정 할 일(task)에 달린 댓글 목록 조회
// -------------------------
export const getTaskCommentsController = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    if (!taskId) {
      return res.status(400).json({ message: "유효하지 않은 taskId입니다." });
    }

    // 기본 페이징 및 정렬 값
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    console.log("req.query:", req.query);
    const order = (req.query.order as "asc" | "desc") || "desc";
    const order_by = (req.query.order_by as "created_at" | "name" | "end_date") || "created_at";

    // 필터 값 가져오기
    const status = (req.query.status as "todo" | "in_progress" | "done") || undefined;
    const assignee = req.query.assignee ? Number(req.query.assignee) : undefined;
    const keyword = (req.query.keyword as string) || undefined;

    // filters 객체 안전하게 구성 (undefined 값 제외)
    const filters: {
      status?: "todo" | "in_progress" | "done";
      assignee?: number;
      keyword?: string;
      order?: "asc" | "desc";
      order_by?: "created_at" | "name" | "end_date";
    } = { order, order_by };

    if (status) filters.status = status;
    if (assignee !== undefined) filters.assignee = assignee;
    if (keyword) filters.keyword = keyword;

    // 서비스 호출
    const comments = await service.getTaskComments(taskId, page, limit, filters);

    console.log("백엔드 조회 결과 comments.data:", comments.data);

    // 항상 배열로 반환해서 프론트에서 map 사용 가능
    res.status(200).json({
      message: "댓글 목록 조회 성공",
      subTasks: comments?.data ?? [],
      total: comments?.total ?? 0,
    });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
};

/**
 * 단일 댓글 조회
 */
export const getCommentByIdController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const commentId = Number(req.params.commentId);

    const comment = await service.getCommentById(userId, commentId);
    res.status(200).json({ message: "댓글 조회 성공", data: comment });
  } catch (err) {
    if (err instanceof AppError) res.status(err.statusCode).json({ message: err.message });
    else res.status(500).json({ message: getErrorMessage(err) });
  }
};

/**
 * 댓글 수정
 */
export const updateCommentController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const commentId = Number(req.params.commentId);
    const { content } = req.body;

    const updated = await service.updateComment(userId, commentId, content);
    res.status(200).json({ message: "댓글 수정 성공", data: updated });
  } catch (err) {
    if (err instanceof AppError) res.status(err.statusCode).json({ message: err.message });
    else res.status(500).json({ message: getErrorMessage(err) });
  }
};

/**
 * 댓글 삭제
 */
export const deleteCommentController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const commentId = Number(req.params.commentId);

    await service.deleteComment(userId, commentId);
    res.status(204).send();
  } catch (err) {
    if (err instanceof AppError) res.status(err.statusCode).json({ message: err.message });
    else res.status(500).json({ message: getErrorMessage(err) });
  }
};
