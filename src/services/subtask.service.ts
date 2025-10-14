import { TaskRepository } from "../repositories/task.repository.js";
import { SubtaskRepository } from "../repositories/subtask.repository.js";

export const SubtaskService = {
  createSubtask: async (taskId: number, title: string) => {
    const task = await TaskRepository.getTaskId(taskId);
    if (!task) {
      throw new Error("할 일을 찾을 수 없습니다.");
    }

    return SubtaskRepository.createSubtask(taskId, title);
  },

  getSubtasks: async (taskId: number, page: number, limit: number) => {
    return await SubtaskRepository.getSubtasks(taskId, page, limit);
  },

  getSubtaskId: async (subtaskId: number) => {
    const subtask = await SubtaskRepository.getSubtaskId(subtaskId);

    if (!subtask) {
      throw new Error("하위 할 일을 찾을 수 없습니다.");
    }

    return subtask;
  },

  updateSubtask: async (subtaskId: number, title: string) => {
    return await SubtaskRepository.updateSubtask(subtaskId, title);
  },

  deleteSubtask: async (subtaskId: number) => {
    const subtask = await TaskRepository.getTaskId(subtaskId);

    if (!subtask) {
      throw new Error("할 일을 찾을 수 없습니다.");
    }

    await SubtaskRepository.deleteSubtask(subtaskId);
  },
};
