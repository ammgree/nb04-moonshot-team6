import { TaskRepository } from "../repositories/task.repository.js";
import { SubtaskRepository } from "../repositories/subtask.repository.js";
import {
  mapFrontendToBackendSubStatus,
  mapBackendToFrontendSubStatus,
} from "../utils/statusMapper.js";
import type { SubtaskStatus } from "@prisma/client";

export const SubtaskService = {
  createSubtask: async (taskId: number, title: string) => {
    const task = await TaskRepository.getTaskId(taskId);
    if (!task) {
      throw new Error("할 일을 찾을 수 없습니다.");
    }

    return SubtaskRepository.createSubtask(taskId, title);
  },

  getSubtasks: async (taskId: number, page: number, limit: number) => {
    const { data: subtasks, total } = await SubtaskRepository.getSubtasks(
      taskId,
      page,
      limit
    );

    return {
      data: subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        taskId: subtask.taskId,
        status: mapBackendToFrontendSubStatus(subtask.status),
        createdAt: subtask.createdAt,
        updatedAt: subtask.updatedAt,
      })),
      total,
    };
  },

  getSubtaskId: async (subtaskId: number) => {
    const subtask = await SubtaskRepository.getSubtaskId(subtaskId);

    if (!subtask) {
      throw new Error("하위 할 일을 찾을 수 없습니다.");
    }

    return {
      id: subtask.id,
      title: subtask.title,
      taskId: subtask.taskId,
      status: mapBackendToFrontendSubStatus(subtask.status),
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    };
  },

  updateSubtask: async (
    subtaskId: number,
    title: string,
    status: SubtaskStatus
  ) => {
    if (status !== undefined) status = mapFrontendToBackendSubStatus(status);
    const subtask = await SubtaskRepository.updateSubtask(
      subtaskId,
      title,
      status
    );

    return {
      id: subtask.id,
      title: subtask.title,
      taskId: subtask.taskId,
      status: mapBackendToFrontendSubStatus(subtask.status),
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    };
  },

  deleteSubtask: async (subtaskId: number) => {
    const subtask = await SubtaskRepository.getSubtaskId(subtaskId);

    if (!subtask) {
      throw new Error("할 일을 찾을 수 없습니다.");
    }

    await SubtaskRepository.deleteSubtask(subtaskId);
  },
};
