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
};
