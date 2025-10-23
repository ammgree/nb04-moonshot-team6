import type { StringValue } from "ms";
import prisma from "../configs/prisma.js";
import type { Comment } from "@prisma/client";

export interface createCommentInput {
  content: string;
  authorId: number;
  taskId: number;
}

export interface commentResponse {
  id: number;
  content: string;
  taskId: number;
  author: {
    id: number;
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface commentListResponse {
  data: commentResponse[];
  total: number;
}

export type CommentResponse = {
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

export class commentRepo {
  async create({ content, authorId, taskId }: createCommentInput): Promise<commentResponse> {
    return prisma.comment.create({
      data: { content, authorId, taskId },
      select: {
        id: true,
        content: true,
        taskId: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async countByTask(taskId: number): Promise<number> {
    return prisma.comment.count({
      where: { taskId },
    });
  }

  async findByTask(taskId: number, page: number, limit: number): Promise<commentListResponse> {
  const total = await prisma.comment.count({
    where: { taskId },
  });

  const data = await prisma.comment.findMany({
    where: { taskId },
    select: {
      id: true,
      content: true,
      taskId: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { data, total };
  }

  async findComment(taskId: number) {
  const comment = await prisma.comment.findMany({
    where: { taskId },
    select: {
      id: true,
      content: true,
      taskId: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return comment;
  }
  
  async updateComment(commentId: number, content: string) {
    const update = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      select : {
        id: true,
        content: true,
        taskId: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImage: true,
        },
      },
        createdAt: true,
        updatedAt: true,
    },
  });
  return update;
  } 

  async deleteComment(commentId: number) {
    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}