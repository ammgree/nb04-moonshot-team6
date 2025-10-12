import type { Task, File, TaskStatus } from "@prisma/client";

export enum Order {
  asc = "asc",
  desc = "desc",
}

export enum OrderBy {
  created_at = "createdAt",
  name = "name",
  end_date = "endAt",
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  assignee?: number;
  keyword?: string;
  order?: Order;
  order_by?: OrderBy;
}

export interface TaskWithRelations extends Task {
  files: File[];
  tags: string[];
  content: string; // 'description' 대응
  assigneeId: number | null;
}
