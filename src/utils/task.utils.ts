import type {
  TaskWithRelations,
  UpdateTaskData,
  UpdateTaskPrismaInput,
} from "../types/task.js";
import {
  mapBackendToFrontendStatus,
  mapFrontendToBackendStatus,
} from "../utils/statusMapper.js";

export const formatDateToParts = (date: Date) => {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

export const TaskToResponse = (task: TaskWithRelations) => {
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
    description: task.content,
    projectId: task.projectId,
    title: task.title,
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
    status: mapBackendToFrontendStatus(task.status),
    assignee: task.assignee,
    tags: task.tags.map((t) => t.tag),
    attachments: task.files,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};

export const UpdateTaskDataToPrisma = (
  data: UpdateTaskData
): UpdateTaskPrismaInput => {
  const input: UpdateTaskPrismaInput = {};

  if (data.title !== undefined) input.title = data.title;
  if (data.description !== undefined) input.content = data.description;
  if (data.status !== undefined)
    input.status = mapFrontendToBackendStatus(data.status);
  if (data.assigneeId !== undefined) input.assigneeId = data.assigneeId;

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

  if (data.tags !== undefined) {
    input.tags = data.tags; // 혹은 prisma에 맞는 형태로 변환 필요 (아래 참고)
  }

  return input;
};
