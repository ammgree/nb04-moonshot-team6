import { TaskStatus, SubtaskStatus } from "@prisma/client";

const frontendToBackendStatusMap: Record<string, TaskStatus> = {
  todo: TaskStatus.TODO,
  in_progress: TaskStatus.IN_PROGRESS,
  done: TaskStatus.DONE,
};

export const mapFrontendToBackendStatus = (status: string): TaskStatus => {
  return frontendToBackendStatusMap[status] || (status as TaskStatus);
};

const backendToFrontendStatusMap: Record<string, string> = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const mapBackendToFrontendStatus = (status: string): string => {
  return backendToFrontendStatusMap[status] || status;
};

const frontendToBackendSubStatusMap: Record<string, SubtaskStatus> = {
  todo: SubtaskStatus.TODO,
  done: SubtaskStatus.DONE,
};

export const mapFrontendToBackendSubStatus = (
  status: string
): SubtaskStatus => {
  return frontendToBackendSubStatusMap[status] || (status as SubtaskStatus);
};

const backendToFrontendSubStatusMap: Record<string, string> = {
  TODO: "todo",
  DONE: "done",
};

export const mapBackendToFrontendSubStatus = (status: string): string => {
  return backendToFrontendSubStatusMap[status] || status;
};
