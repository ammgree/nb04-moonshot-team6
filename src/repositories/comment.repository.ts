import prisma from "../configs/prisma.js";

/**
 * 댓글 생성
 */
export const createCommentRepo = (authorId: number, taskId: number, content: string) => {
  return prisma.comment.create({
    data: { content, authorId, taskId },
    select: {
      id: true,
      content: true,
      taskId: true,
      author: { select: { id: true, name: true, email: true, profileImage: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getTaskCommentsRepo = async (
  whereClause: any,
  skip: number,
  take: number,
  orderBy: Record<string, "asc" | "desc">
) => {
  const data = await prisma.comment.findMany({
    where: whereClause,
    orderBy: [orderBy],
    skip,
    take,
    select: {
      id: true,
      content: true,
      taskId: true,
      author: { select: { id: true, name: true, email: true, profileImage: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.comment.count({
    where: whereClause,
  });

  return { data, total };
};

/**
 * 단일 댓글 조회
 */
export const findCommentByIdRepo = (commentId: number) => {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      content: true,
      taskId: true,
      authorId: true,
      author: { select: { id: true, name: true, email: true, profileImage: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * 댓글 수정
 */
export const updateCommentRepo = (commentId: number, content: string) => {
  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    select: {
      id: true,
      content: true,
      taskId: true,
      author: { select: { id: true, name: true, email: true, profileImage: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * 댓글 삭제
 */
export const deleteCommentRepo = (commentId: number) => {
  return prisma.comment.delete({ where: { id: commentId } });
};
