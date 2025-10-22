import { SubtaskStatus } from "@prisma/client";
import prisma from "../configs/prisma.js";

export const SubtaskRepository = {
  createSubtask: async (taskId: number, title: string) => {
    return await prisma.subtask.create({
      data: {
        title,
        taskId,
      },
    });
  },

  getSubtasks: async (taskId: number, page: number, limit: number) => {
    const [subtasks, total] = await Promise.all([
      prisma.subtask.findMany({
        where: { taskId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.subtask.count({ where: { taskId } }),
    ]);

    return { data: subtasks, total };
  },

  getSubtaskId: async (subtaskId: number) => {
    return await prisma.subtask.findUnique({
      where: {
        id: subtaskId,
      },
    });
  },

  updateSubtask: async (
    subtaskId: number,
    title: string,
    status: SubtaskStatus
  ) => {
    return await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        title,
        status,
      },
    });
  },

  deleteSubtask: async (subtaskId: number) => {
    await prisma.subtask.delete({
      where: { id: subtaskId },
    });
  },
};
