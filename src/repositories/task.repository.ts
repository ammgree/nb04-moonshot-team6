import prisma from "../configs/prisma.js";
import { Prisma } from "@prisma/client";
import type {
  CreateTaskPrismaInput,
  GetTasksQuery,
  UpdateTaskPrismaInput,
} from "../types/task.js";

export const TaskRepository = {
  createTask: async (data: CreateTaskPrismaInput) => {
    return await prisma.task.create({
      data: {
        title: data.title,
        content: data.content,
        startAt: data.startAt,
        endAt: data.endAt,
        project: { connect: { id: data.projectId } },
        ...(data.assigneeId && {
          assignee: { connect: { id: data.assigneeId } },
        }),
        ...(data.tags && {
          tags: {
            create: data.tags.map((t) => ({
              tag: {
                connectOrCreate: {
                  where: { name: t.tag.connectOrCreate.where.name },
                  create: { name: t.tag.connectOrCreate.create.name },
                },
              },
            })),
          },
        }),
      },
      include: {
        assignee: true,
        files: true,
        tags: {
          include: { tag: true },
        },
      },
    });
  },

  getTasks: async (projectId: number, query: GetTasksQuery) => {
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
      filter.length > 0
        ? {
            AND: [
              { projectId }, // 항상 포함
              { OR: filter }, // 여러 필터 중 하나만 만족하면 통과
            ],
          }
        : { projectId };

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
          tags: {
            include: { tag: true },
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
        tags: {
          include: { tag: true },
        },
        files: true,
      },
    });
  },

  updateTask: async (data: UpdateTaskPrismaInput, taskId: number) => {
    const { tags, ...rest } = data;

    // tags가 없는 경우는 간단히 업데이트만 수행
    if (tags === undefined) {
      return await prisma.task.update({
        where: { id: taskId },
        data: rest,
        include: {
          assignee: {
            select: { id: true, name: true, email: true, profileImage: true },
          },
          tags: { include: { tag: true } },
          files: true,
        },
      });
    }

    // tags가 있는 경우, 트랜잭션으로 기존 태그 삭제 후 새로 생성
    return await prisma.$transaction(async (tx) => {
      // 1. 이 태스크와 연결된 모든 기존 TaskTag 기록을 삭제합니다.
      await tx.taskTag.deleteMany({
        where: { taskId: taskId },
      });

      // 2. 태스크의 다른 정보들을 업데이트하고, 새로운 태그들을 연결합니다.
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          ...rest, // title, content 등 나머지 필드 업데이트
          tags: {
            create: tags.map((tagName: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true, profileImage: true },
          },
          tags: { include: { tag: true } },
          files: true,
        },
      });

      return updatedTask;
    });
  },

  deleteTask: async (taskId: number) => {
    await prisma.task.delete({
      where: { id: taskId },
    });
  },

  findProjectMemberByTaskId: async (taskId: number, userId: number) => {
    const project = await prisma.project.findFirst({
      where: {
        tasks: {
          some: { id: taskId },
        },
        members: {
          some: { userId },
        },
      },
    });
    return !!project;
  },

  findProjectMemberByProjectId: async (projectId: number, userId: number) => {
    return await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });
  },
};
