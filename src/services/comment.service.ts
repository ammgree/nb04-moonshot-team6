import prisma from "../configs/prisma.js";
import { HttpError } from "../utils/HttpError.js";
import { commentRepo } from "../repositories/comment.repository.js";
import type { commentResponse } from "../repositories/comment.repository.js";

const CommentRepo = new commentRepo();

export async function createdComment(userId: number, taskId: number, content: string) {
  if (!userId) 
    throw new HttpError("로그인이 필요합니다", 401)

  if (!taskId || !content) {
    throw new HttpError("잘못된 요청 형식", 400);
  };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  })

  if (!task) {
    throw new HttpError("존재하지 않는 할 일입니다.", 404);
  }

  const isMember = await prisma.projectMember.findFirst({
    where: { userId, projectId: task.projectId },
  });

  if (!isMember) {
    throw new HttpError("프로젝트 멤버가 아닙니다", 403);
  }
  
  return await CommentRepo.create({ content, taskId, authorId: userId })
}


type CommentResponse = {
    id: number;
    content:string;
    taskId: number;
    author: {
      id: number;
      name: string | null;
      email: string;
      profileImage: string | null;
    };
    createdAt: Date;
    updatedAt: Date;
  };


export async function getedtaskComment(userId: number, taskId: number, page: number, limit: number): Promise<{
  data: CommentResponse[]; total: number }> 
 {
  if (!userId) {
    throw new HttpError("로그인이 필요합니다", 401);
  }
  
  if (!taskId || page <= 0 || limit <= 0) {
    throw new HttpError ("잘못된 요청 형식", 400);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new HttpError("작업을 찾을 수 없습니다", 404);
  }

  const membership = await prisma.projectMember.findFirst({
    where: { userId },
    include: { project: true }
  });
  
  if (!membership) {
    throw new HttpError("프로젝트 멤버가 아닙니다", 403);
  }

  const total = await prisma.comment.count({
    where: { taskId },
  });

  return await CommentRepo.findByTask(taskId, page, limit);
 }


export async function getedComment(userId: number, taskId: number) {
  if (!userId) {
    throw new HttpError("로그인이 필요합니다", 401);
  }

  if (!taskId || taskId <= 0) {
    throw new HttpError ("잘못된 요청 형식", 400);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new HttpError("작업을 찾을 수 없습니다", 404);
  }

  const membership = await prisma.projectMember.findFirst({
    where: { userId },
    include: { project: true }
  });
  
  if (!membership) {
    throw new HttpError("프로젝트 멤버가 아닙니다", 403);
  }

  return await CommentRepo.findComment(taskId);
}


export async function patchedComment(userId: number, commentId: number, taskId: number, content: string) {
  if (!userId) {
    throw new HttpError("로그인이 필요합니다", 401);
  }

  if (!taskId || taskId <= 0) {
    throw new HttpError("잘못된 요청 형식", 400);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new HttpError("작업을 찾을 수 없습니다", 404);
  }

  const membership = await prisma.projectMember.findFirst({
    where: {
      userId,
      projectId: task.projectId,
    },
  });
  
  if (!membership) {
    throw new HttpError("프로젝트 멤버가 아닙니다", 403);
  }

  const edit = await prisma.comment.findFirst({
    where: { id: commentId, authorId: userId },
  })

  if (!edit) {
    throw new HttpError("자신이 작성한 댓글만 수정할 수 있습니다", 403);
  }

  return await CommentRepo.updateComment(commentId, content);
}


export async function deletedComment(userId: number, taskId: number, commentId: number) {
  if (!userId) {
    throw new HttpError("로그인이 필요합니다", 401);
  }

  if (!taskId || taskId <= 0) {
    throw new HttpError("잘못된 요청 형식", 400);
  }
  
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new HttpError("작업을 찾을 수 없습니다", 404);
  }
  
  const membership = await prisma.projectMember.findFirst({
    where: { id: userId },
    include: { project: true }
  });
  
  if (!membership) {
    throw new HttpError("프로젝트 멤버가 아닙니다", 403);
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (comment?.authorId !== userId) {
    throw new HttpError("자신이 작성한 댓글만 수정할 수 있습니다", 403);
  }
  
  return await CommentRepo.deleteComment(commentId);
}