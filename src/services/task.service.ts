import type { GetTasksQuery, TaskWithRelations } from "types/task.js";
import { OrderBy, Order } from "../types/task.js";
import { TaskRepository } from "../repositories/task.repository.js";

function formatDateToParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
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

export const TaskService = {
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
};
