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
};
