import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const SubtaskRepository = {
  createSubtask: async (taskId: number, title: string) => {
    return prisma.subtask.create({
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
    return prisma.subtask.findUnique({
      where: {
        id: subtaskId,
      },
    });
  },
};
