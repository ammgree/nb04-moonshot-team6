import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import express, { response } from 'express';

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

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

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
}

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
    WHERE p."ownerId" = ${ownerId}
    GROUP BY p.id
    ORDER BY p."createdAt" DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  res.status(200).json({ data: result });
};
/*
const getMyProjectsWithCounts = async(req: Request, res: Response): Promise<void> => {
  const offset = typeof req.query.offset === 'string' ? req.query.offset : '0';
  const limit = typeof req.query.limit === 'string' ? req.query.limit : '10';
  
  const { sort } = req.query;
  let orderBy;
  switch (sort) {
    case 'name':
      orderBy = { name: 'asc' as const };
      break;
    case 'latest':
      orderBy = { createdAt: 'desc' as const };
      break;
    default:
      orderBy = { createdAt: 'asc' as const };
  }
  const projects = await prisma.project.findMany({
    where: { ownerId: req.token ? Number(req.token.userId) : 0 },
    orderBy,
    skip: parseInt(offset, 10),
    take: parseInt(limit, 10),
    select: {
        id: true,
        name: true,
        description: true,
        _count: {select: { members: true,    // 프로젝트 멤버 수
                           tasks: { TODO: true, IN_PROGRESS: true, DONE: true }  // 프로젝트 내 할 일 수
        },  
      }
    }
  });
//   const projectsWithCounts = await prisma.task.groupBy({
//   by: ['status'],   // 그룹핑할 컬럼명 배열
//   where: { projectId: { in: projects.map(project => project.id) } },
//   _count: {
//     _all: true,   // 각 그룹별 행 수 계산
//   },
// }).then(counts => projects.map(project => {
//   const projectCounts = counts.filter(count => count.projectId === project.id);
//   return { project, todoCounts: projectCounts };
// }));
  res.status(200).send({ projectList: projectsWithCounts });
};
*/


// const getTodoCountsByProject = async (projectId: number) => {
//   const doneCount = await prisma.task.count({
//     where: { projectId, status: 'DONE' },
//   });
//   const inProgressCount = await prisma.task.count({
//     where: { projectId, status: 'IN_PROGRESS' },
//   });
//   const todoCount = await prisma.task.count({
//     where: { projectId, status: 'TODO' },
//   });

//   return { doneCount, inProgressCount, todoCount };
// };

/*async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany();
  res.status(200).json(projects);
} */


export default {
  createUsers,
  getUser,
  getProjectsWithCounts
}