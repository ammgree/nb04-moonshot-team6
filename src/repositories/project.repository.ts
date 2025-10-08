import prisma from "../configs/prisma.js";

export const countUserProjects = (userId: number) => {
  return prisma.project.count({ where: { ownerId: userId } });
};

export const createProjectRepo = (
  userId: number,
  data: { name: string; description?: string }
) => {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      ownerId: userId,
      members: { create: { userId, role: "OWNER" } },
    },
    include: { members: true, tasks: true },
  });
};

export const getUserProjectsRepo = (
  userId: number,
  sort: "latest" | "name"
) => {
  return prisma.project.findMany({
    where: { members: { some: { userId } } },
    include: { members: true, tasks: true },
    orderBy: sort === "latest" ? { createdAt: "desc" } : { name: "asc" },
  });
};

export const findProjectById = (projectId: number) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: true } },
      tasks: true,
    },
  });
};

export const updateProjectRepo = (
  projectId: number,
  data: { name?: string; description?: string }
) => {
  return prisma.project.update({
    where: { id: projectId },
    data,
    include: { members: true, tasks: true },
  });
};

export const deleteProjectRepo = (projectId: number) => {
  return prisma.project.delete({ where: { id: projectId } });
};
