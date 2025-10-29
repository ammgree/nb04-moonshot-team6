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
        ...(data.attachments && {
          files: {
            create: data.attachments.map((fileUrl: string) => ({
              url: fileUrl,
              filename: fileUrl.split("/").pop() || "unknown",
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
              { AND: filter },
            ],
          }
        : { projectId };

    const orderByFieldMap: Record<
      string,
      keyof Prisma.TaskOrderByWithRelationInput
    > = {
      created_at: "createdAt",
      end_date: "endAt",
      title: "title",
    };

    // 기본 정렬: createdAt, endAt, title 모두 asc
    let orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      { createdAt: "asc" },
      { endAt: "asc" },
      { title: "asc" },
    ];

    if (query.order_by) {
      const field = orderByFieldMap[query.order_by];
      if (field) {
        // 쿼리 들어오면 무조건 asc
        orderBy = [{ [field]: "asc" }];
      }
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
    // 1. data에서 tags, attachments, 나머지(rest)를 분리합니다.
    //    (attachments의 기본값 = [] 를 제거해야 undefined 체크가 가능합니다)
    const { tags, attachments, ...rest } = data;

    // 2. 트랜잭션 시작
    return await prisma.$transaction(async (tx) => {
      // 3. 태그(Tags) 동기화 로직
      //    tags 필드가 undefined가 아닐 때(즉, 클라이언트에서 수정 요청을 보냈을 때)만 실행
      if (tags !== undefined) {
        // 3-1. 기존 태그 연결(TaskTag)을 모두 삭제
        await tx.taskTag.deleteMany({
          where: { taskId },
        });

        // 3-2. 새로운 태그 리스트를 순회하며 upsert 및 재연결
        for (const tagName of tags) {
          // 3-3. 태그가 없으면 생성(create), 있으면 가져옴(upsert)
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });

          // 3-4. Task와 Tag를 다시 연결
          await tx.taskTag.create({
            data: {
              taskId,
              tagId: tag.id,
            },
          });
        }
      }

      // 4. 첨부파일(Attachments) 동기화 로직
      //    attachments 필드가 undefined가 아닐 때만 실행
      if (attachments !== undefined) {
        // 4-1. DB에서 현재 task에 연결된 파일 URL 리스트 조회
        const existingFiles = await tx.file.findMany({
          where: { taskId },
          select: { id: true, url: true },
        });
        const existingUrls = existingFiles.map((f) => f.url);

        // 4-2. 삭제할 파일 URL 계산 (DB O, 클라이언트 X)
        const urlsToRemove = existingUrls.filter(
          (url) => !attachments.includes(url)
        );

        // 4-3. 추가할 파일 URL 계산 (클라이언트 O, DB X)
        const urlsToAdd = attachments.filter(
          (url) => !existingUrls.includes(url)
        );

        // 4-4. 삭제 처리
        if (urlsToRemove.length > 0) {
          await tx.file.deleteMany({
            where: {
              url: { in: urlsToRemove },
              taskId,
            },
          });
        }

        // 4-5. 추가 처리
        if (urlsToAdd.length > 0) {
          await tx.file.createMany({
            data: urlsToAdd.map((url) => {
              const parts = url.split("/");
              const filename = parts[parts.length - 1]!; // '!'로 타입 단언

              return {
                url,
                filename,
                taskId,
                mimeType: null,
                size: null,
                uploaderId: null,
              };
            }),
          });
        }
      }

      // 5. 태그와 파일을 제외한 나머지(rest) 필드 업데이트
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: rest, // (예: title, description, dueDate 등)
        include: {
          // 업데이트된 최신 관계 데이터를 포함하여 반환
          assignee: {
            select: { id: true, name: true, email: true, profileImage: true },
          },
          tags: { include: { tag: true } },
          files: true,
        },
      });

      // 6. 트랜잭션 결과 반환
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
