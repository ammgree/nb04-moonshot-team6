import type {
  CreateTaskData,
  GetTasksQuery,
  TaskWithRelations,
  UpdateTaskData,
  UpdateTaskPrismaInput,
} from "../types/task.js";
import { OrderBy, Order } from "../types/task.js";
import { TaskRepository } from "../repositories/task.repository.js";

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
      content: body.content,
      startAt,
      endAt,
      projectId,
      assigneeId: assigneeId,
      tags: body.tags ?? [],
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

    const { data: tasks, total } = await TaskRepository.getTasks(projectId, {
      ...query,
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
    content: task.content,
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
