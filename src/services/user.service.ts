import * as repo from "../repositories/project.repository.js";
import bcrypt from 'bcrypt';
import prisma from '../configs/prisma.js';
import type { Request, Response } from 'express';
import express from 'express';

const app = express();
app.use(express.json());

// 회원가입 서비스
const createUsers = async(req: Request, res: Response) => {
  const existUser = await prisma.user.findUnique({
    where: { email: req.body.email }
  });
  if (existUser) {
    return res.status(409).send({ errorMessage: '이미 가입된 이메일입니다.' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = await prisma.user.create({
    data: {
      ...req.body,
      password: hashedPassword,
    },
  });
  const { password, ...safeUser } = user;
  res.status(201).send(safeUser);
};

declare global {
  namespace Express {
    interface Request {
      token?: {
        userId: number;
        [key: string]: any;
      };
    }
  }
}

// 유저 조회
const getUser = async(req: Request, res: Response) => {
  if (!req.token) {
    return res.status(401).send({ errorMessage: '토큰이 만료되었습니다.' });
  }
  const userId = Number(req.token.userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  res.status(200).json(user);
};

/*
const getProjectsWithCounts = async (req: Request, res: Response) => {
  const ownerId = req.token ? Number(req.token.userId) : 0;
  const offset = Number(req.query.offset || 0);
  const limit = Number(req.query.limit || 10);

  const result = await prisma.$queryRaw<
    Array<{
      id: number,
      name: string,
      description: string,
      memberCount: number,
      todoCount: number,
      inProgressCount: number,
      doneCount: number,
    }>
  >`
    SELECT 
      p.id,
      p.name,
      p.description,
      COUNT(DISTINCT pm.id) ::INT AS "memberCount",
      SUM(CASE WHEN t.status = 'TODO' THEN 1 ELSE 0 END) ::INT AS "todoCount",
      SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) ::INT AS "inProgressCount",
      SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END) ::INT AS "doneCount",
      p."createdAt" AS "createdAt",
      p."updatedAt" AS "updatedAt"
    FROM "Project" p
    LEFT JOIN "ProjectMember" pm ON pm."projectId" = p.id
    LEFT JOIN "Task" t ON t."projectId" = p.id
    WHERE pm."userId" = ${ownerId}
    GROUP BY p.id
    ORDER BY p."createdAt" DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
  res.status(200).json({ data: result });
};
*/

export const getUserProjects = async (
  userId: number,
  sort: "latest" | "name" = "latest"
) => {
  const projects = await repo.getUserProjectsRepo(userId, sort);
  const data = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    memberCount: p.members.length,
    todoCount: p.tasks?.filter((t) => t.status === "TODO").length ?? 0,
    inProgressCount:
      p.tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    doneCount: p.tasks?.filter((t) => t.status === "DONE").length ?? 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  return {
    data,
    total: data.length,
  };
};

export default {
  createUsers,
  getUser,
  getUserProjects
};