import { PrismaClient, Prisma } from "@prisma/client";
import type {
  CreateTaskPrismaInput,
  GetTasksQuery,
  UpdateTaskPrismaInput,
} from "../types/task.js";

const prisma = new PrismaClient();

export const TaskRepository = {
  createTask: async (data: CreateTaskPrismaInput) => {
    return await prisma.task.create({
      data,
      include: {
        assignee: true,
        files: true,
      },
    });
  },

  getTasks: async (query: GetTasksQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filter: Prisma.TaskWhereInput[] = [];

    if (query.status) {
      filter.push({ status: query.status });
    }

    if (query.assignee !== undefined) {
      filter.push({ assigneeId: { equals: Number(query.assignee) } });
    }

    if (query.keyword) {
      filter.push({ title: { contains: query.keyword, mode: "insensitive" } });
    }

    const where: Prisma.TaskWhereInput =
      filter.length > 0 ? { OR: filter } : {};

    let orderBy: Prisma.TaskOrderByWithRelationInput = {
      createdAt: "desc",
    };

    if (query.order_by && query.order) {
      orderBy = {
        [query.order_by]: query.order,
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          files: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { data: tasks, total };
  },

  getTaskId: async (taskId: number) => {
    return await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        files: true,
      },
    });
  },

  updateTask: async (data: UpdateTaskPrismaInput, taskId: number) => {
    return await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        files: true,
      },
    });
  },

  deleteTask: async (taskId: number) => {
    await prisma.task.delete({
      where: { id: taskId },
    });
  },
};
