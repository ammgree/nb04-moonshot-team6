import prisma from "../configs/prisma.js";

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