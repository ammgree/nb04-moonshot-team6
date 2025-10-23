import { TaskRepository } from "../repositories/task.repository.js";
import { SubtaskRepository } from "../repositories/subtask.repository.js";
import {
  mapFrontendToBackendSubStatus,
  mapBackendToFrontendSubStatus,
} from "../utils/statusMapper.js";
import type { SubtaskStatus } from "@prisma/client";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.js";

export const SubtaskService = {
  createSubtask: async (userId: number, taskId: number, title: string) => {
    if (!userId || isNaN(userId)) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const task = await TaskRepository.getTaskId(taskId);
    if (!task) {
      throw new NotFoundError();
    }

    if (!title) {
      throw new BadRequestError("제목은 필수입니다.");
    }

    return SubtaskRepository.createSubtask(taskId, title);
  },

  getSubtasks: async (
    userId: number,
    taskId: number,
    page: number,
    limit: number
  ) => {
    if (!userId || isNaN(userId)) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const { data: subtasks, total } = await SubtaskRepository.getSubtasks(
      taskId,
      page,
      limit
    );

    if (!subtasks) {
      throw new NotFoundError("하위 할 일을 찾을 수 없습니다.");
    }

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

  getSubtaskId: async (userId: number, subtaskId: number) => {
    if (!userId || isNaN(userId)) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const subtask = await SubtaskRepository.getSubtaskId(subtaskId);

    if (!subtask) {
      throw new NotFoundError("하위 할 일을 찾을 수 없습니다.");
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
    userId: number,
    subtaskId: number,
    title: string,
    status: SubtaskStatus
  ) => {
    if (!userId || isNaN(userId)) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const subtask = await SubtaskRepository.getSubtaskId(subtaskId);

    if (!subtask) {
      throw new NotFoundError("하위 할 일을 찾을 수 없습니다.");
    }

    const task = await TaskRepository.getTaskId(subtask.taskId);

    if (!task) {
      throw new NotFoundError("할 일을 찾을 수 없습니다.");
    }
    const isMember = await TaskRepository.findProjectMemberByProjectId(
      task.projectId,
      userId
    );

    if (!isMember) {
      throw new ForbiddenError("프로젝트 멤버가 아닙니다.");
    }

    if (status !== undefined) status = mapFrontendToBackendSubStatus(status);
    const updatedsubtask = await SubtaskRepository.updateSubtask(
      subtaskId,
      title,
      status
    );

    return {
      id: updatedsubtask.id,
      title: updatedsubtask.title,
      taskId: updatedsubtask.taskId,
      status: mapBackendToFrontendSubStatus(updatedsubtask.status),
      createdAt: updatedsubtask.createdAt,
      updatedAt: updatedsubtask.updatedAt,
    };
  },

  deleteSubtask: async (userId: number, subtaskId: number) => {
    if (!userId || isNaN(userId)) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const subtask = await SubtaskRepository.getSubtaskId(subtaskId);

    if (!subtask) {
      throw new NotFoundError("하위 할 일을 찾을 수 없습니다.");
    }

    const task = await TaskRepository.getTaskId(subtask.taskId);

    if (!task) {
      throw new NotFoundError("할 일을 찾을 수 없습니다.");
    }
    const isMember = await TaskRepository.findProjectMemberByProjectId(
      task.projectId,
      userId
    );

    if (!isMember) {
      throw new ForbiddenError("프로젝트 멤버가 아닙니다.");
    }

    await SubtaskRepository.deleteSubtask(subtaskId);
  },
};
