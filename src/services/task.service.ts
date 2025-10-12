import type {
  CreateTaskData,
  GetTasksQuery,
  TaskWithRelations,
  UpdateTaskData,
  UpdateTaskPrismaInput,
} from "types/task.js";
import { OrderBy, Order } from "../types/task.js";
import { TaskRepository } from "../repositories/task.repository.js";

function formatDateToParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function TaskToResponse(task: TaskWithRelations) {
  const {
    year: startYear,
    month: startMonth,
    day: startDay,
  } = formatDateToParts(task.startAt!);
  const {
    year: endYear,
    month: endMonth,
    day: endDay,
  } = formatDateToParts(task.endAt!);

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.content,
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
    status: task.status,
    assignee: task.assigneeId,
    tags: task.tags,
    attachments: task.files,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function UpdateTaskDataToPrisma(data: UpdateTaskData): UpdateTaskPrismaInput {
  const input: UpdateTaskPrismaInput = {};

  if (data.title !== undefined) input.title = data.title;
  if (data.status !== undefined) input.status = data.status;
  if (data.assigneeId !== undefined) input.assigneeId = data.assigneeId;
  if (data.tags !== undefined) input.tags = data.tags;

  if (
    data.startYear !== undefined &&
    data.startMonth !== undefined &&
    data.startDay !== undefined
  ) {
    input.startAt = new Date(
      data.startYear,
      data.startMonth - 1,
      data.startDay
    );
  }

  if (
    data.endYear !== undefined &&
    data.endMonth !== undefined &&
    data.endDay !== undefined
  ) {
    input.endAt = new Date(data.endYear, data.endMonth - 1, data.endDay);
  }

  return input;
}

export const TaskService = {
  createTask: async (body: CreateTaskData, projectId: number) => {
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
      assigneeId: body.assigneeId,
      tags: body.tags ?? [],
    });

    return TaskToResponse(task);
  },

  getTasks: async (query: GetTasksQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order_by = query.order_by ?? OrderBy.created_at;
    const order = query.order ?? Order.desc;

    const { data: tasks, total } = await TaskRepository.getTasks({
      ...query,
      page,
      limit,
      order_by,
      order,
    });

    const formattedTasks = tasks.map((task) => TaskToResponse(task));

    return { data: formattedTasks, total };
  },

  getTaskId: async (taskId: number) => {
    const task = await TaskRepository.getTaskId(taskId);

    if (!task) {
      throw new Error("Task not found");
    }
    return TaskToResponse(task);
  },

  updateTask: async (body: UpdateTaskData, taskId: number) => {
    const prismaInput = UpdateTaskDataToPrisma(body);

    const updateTask = await TaskRepository.updateTask(prismaInput, taskId);

    return TaskToResponse(updateTask);
  },
};
