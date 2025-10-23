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

export interface CreateTaskData {
  title: string;
  description: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  assigneeId: number;
  tags?: string[];
}

export interface CreateTaskPrismaInput {
  title: string;
  content: string;
  startAt: Date;
  endAt: Date;
  projectId: number;
  assigneeId?: number;
  tags?: {
    tag: {
      connectOrCreate: {
        where: { name: string };
        create: { name: string };
      };
    };
  }[];
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus | undefined;
  assignee?: number;
  keyword?: string;
  order?: Order;
  order_by?: OrderBy;
}

export interface TaskWithRelations extends Task {
  files: File[];
  tags: {
    tag: {
      id: number;
      name: string;
    };
  }[];
  content: string; // 'description' 대응
  assignee: {
    id: number;
    name: string | null;
    email: string;
    profileImage: string | null;
  } | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  status?: TaskStatus;
  assigneeId?: number;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTaskPrismaInput {
  title?: string;
  content?: string;
  startAt?: Date;
  endAt?: Date;
  status?: TaskStatus;
  assigneeId?: number;
  tags?: string[];
}
