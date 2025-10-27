import prisma from "../configs/prisma.js";
import * as repo from "../repositories/comment.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../utils/error.js";

/**
 * 댓글 생성
 */
export const createComment = async (userId: number, taskId: number, content: string) => {
  if (!userId || isNaN(userId)) throw new UnauthorizedError("로그인이 필요합니다");
  if (!taskId || !content || typeof content !== "string") throw new BadRequestError("잘못된 요청 형식");

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
  if (!task) throw new NotFoundError("존재하지 않는 할 일입니다.");

  const isMember = await prisma.projectMember.findFirst({ where: { userId, projectId: task.projectId } });
  if (!isMember) throw new ForbiddenError("프로젝트 멤버가 아닙니다");

  return repo.createCommentRepo(userId, taskId, content);
};

export const getTaskComments = async (
  taskId: number,
  page: number,
  limit: number,
  filters: {
    status?: "todo" | "in_progress" | "done";
    assignee?: number;
    keyword?: string;
    order?: "asc" | "desc";
    order_by?: "created_at" | "name" | "end_date";
  } = {}
) => {
  if (!taskId || page <= 0 || limit <= 0) throw new BadRequestError("잘못된 요청 형식");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task) throw new NotFoundError("할 일을 찾을 수 없습니다");

  // 프로젝트 멤버 체크 (로그인 체크 없이도 가능)
  const membership = await prisma.projectMember.findFirst({
    where: { projectId: task.projectId },
  });
  if (!membership) throw new ForbiddenError("프로젝트 멤버가 아닙니다");

  const offset = (page - 1) * limit;

  // whereClause 구성
  const whereClause: any = {
    taskId,
    ...(filters.status && { status: filters.status }),
    ...(filters.assignee && { authorId: filters.assignee }),
    ...(filters.keyword && { content: { contains: filters.keyword, mode: "insensitive" } }),
  };

  // orderBy 구성
  const orderByMap: Record<"created_at" | "end_date" | "name", "createdAt" | "endDate" | "content"> = {
    created_at: "createdAt",
    end_date: "endDate",
    name: "content",
  };

  const orderBy: Record<string, "asc" | "desc"> = {};
  if (filters.order_by && orderByMap[filters.order_by]) {
    orderBy[orderByMap[filters.order_by]] = filters.order ?? "asc";
  } else {
    orderBy["createdAt"] = "desc";
  }

  return repo.getTaskCommentsRepo(whereClause, offset, limit, orderBy);
};

/**
 * 단일 댓글 조회
 */
export const getCommentById = async (userId: number, commentId: number) => {
  if (!userId || isNaN(userId)) throw new UnauthorizedError("로그인이 필요합니다");

  const comment = await repo.findCommentByIdRepo(commentId);
  if (!comment) throw new NotFoundError("댓글을 찾을 수 없습니다");

  const task = await prisma.task.findUnique({ where: { id: comment.taskId }, include: { project: true } });
  if (!task) throw new NotFoundError("해당 댓글의 할 일을 찾을 수 없습니다");

  const membership = await prisma.projectMember.findFirst({ where: { userId, projectId: task.projectId } });
  if (!membership) throw new ForbiddenError("프로젝트 멤버가 아닙니다");

  return comment;
};

/**
 * 댓글 수정
 */
export const updateComment = async (userId: number, commentId: number, content: string) => {
  if (!userId || isNaN(userId)) throw new UnauthorizedError("로그인이 필요합니다");
  if (!content || typeof content !== "string") throw new BadRequestError("잘못된 요청 형식");

  const comment = await repo.findCommentByIdRepo(commentId);
  if (!comment) throw new NotFoundError("댓글을 찾을 수 없습니다");
  if (comment.authorId !== userId) throw new ForbiddenError("자신의 댓글만 수정할 수 있습니다");

  return repo.updateCommentRepo(commentId, content);
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (userId: number, commentId: number) => {
  if (!userId || isNaN(userId)) throw new UnauthorizedError("로그인이 필요합니다");

  const comment = await repo.findCommentByIdRepo(commentId);
  if (!comment) throw new NotFoundError("댓글을 찾을 수 없습니다");
  if (comment.authorId !== userId) throw new ForbiddenError("자신의 댓글만 삭제할 수 있습니다");

  return repo.deleteCommentRepo(commentId);
};
