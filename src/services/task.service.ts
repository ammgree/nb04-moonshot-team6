import type {
  CreateTaskData,
  GetTasksQuery,
  UpdateTaskData,
} from "../types/task.js";
import { OrderBy, Order } from "../types/task.js";
import { TaskRepository } from "../repositories/task.repository.js";
import { TaskToResponse, UpdateTaskDataToPrisma } from "../utils/task.utils.js";
import { mapFrontendToBackendStatus } from "../utils/statusMapper.js";

export const TaskService = {
  createTask: async (
    body: CreateTaskData,
    projectId: number,
    assigneeId: number
  ) => {
    const startAt = new Date(
      body.startYear,
      body.startMonth - 1,
      body.startDay
    );
    const endAt = new Date(body.endYear, body.endMonth - 1, body.endDay);

    const task = await TaskRepository.createTask({
      title: body.title,
      content: body.description,
      startAt,
      endAt,
      projectId,
      assigneeId,
      tags: (body.tags ?? []).map((tagName) => ({
        tag: {
          connectOrCreate: {
            where: { name: tagName },
            create: { name: tagName },
          },
        },
      })),
    });

    return TaskToResponse(task);
  },

  getTasks: async (projectId: number, userId: number, query: GetTasksQuery) => {
    const isMember = await TaskRepository.findProjectMemberByProjectId(
      projectId,
      userId
    );

    if (!isMember) {
      throw new Error("해당 프로젝트의 멤버가 아닙니다.");
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const order_by = query.order_by ?? OrderBy.created_at;
    const order = query.order ?? Order.desc;
    const status = query.status
      ? mapFrontendToBackendStatus(query.status)
      : undefined;

    const { data: tasks, total } = await TaskRepository.getTasks(projectId, {
      ...query,
      status,
      page,
      limit,
      order_by,
      order,
    });

    const formattedTasks = tasks.map((task) => TaskToResponse(task));

    return { data: formattedTasks, total };
  },

  getTaskId: async (taskId: number, userId: number) => {
    const isMember = await TaskRepository.findProjectMemberByTaskId(
      taskId,
      userId
    );

    if (!isMember) {
      throw new Error("해당 프로젝트의 멤버가 아닙니다.");
    }

    const task = await TaskRepository.getTaskId(taskId);

    if (!task) {
      throw new Error("Task not found");
    }
    return TaskToResponse(task);
  },

  updateTask: async (body: UpdateTaskData, taskId: number, userId: number) => {
    const isMember = await TaskRepository.findProjectMemberByTaskId(
      taskId,
      userId
    );

    if (!isMember) {
      throw new Error("해당 프로젝트의 멤버가 아닙니다.");
    }

    const prismaInput = UpdateTaskDataToPrisma(body);

    const updateTask = await TaskRepository.updateTask(prismaInput, taskId);

    return TaskToResponse(updateTask);
  },

  deleteTask: async (taskId: number, userId: number) => {
    const isMember = await TaskRepository.findProjectMemberByTaskId(
      taskId,
      userId
    );

    if (!isMember) {
      throw new Error("해당 프로젝트의 멤버가 아닙니다.");
    }

    const task = await TaskRepository.getTaskId(taskId);

    if (!task) {
      throw new Error("할 일을 찾을 수 없습니다.");
    }

    await TaskRepository.deleteTask(taskId);
  },
};
