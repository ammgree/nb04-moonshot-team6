import * as userRepo from "../repositories/user.repository.js";
import auth from '../middlewares/auth.middleware.js';
import bcrypt from 'bcrypt';
import prisma from '../configs/prisma.js';
import express from 'express';
import createError  from 'http-errors';
import { Prisma } from "@prisma/client";

const app = express();
app.use(express.json());

// 회원가입 서비스
const createUsers = async(
  userData:{
    email:string, 
    name:string, 
    password:string,
    profileImage: string
  }) => {
  const existUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });
  if (existUser) {
    throw new createError .Conflict('이미 가입된 이메일입니다.');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  const user = await userRepo.createUserRepository({
    email: userData.email,
    name: userData.name,
    password: hashedPassword,
    profileImage: userData.profileImage ?? null,
  });
  return user;
};

// 유저 조회
const getUser = async(userId: number) => {
  const user = await userRepo.getUserRepository(userId);
  if (!user) {
    throw new createError.NotFound('유저를 찾을 수 없습니다.');
  }
  return user;
};

// 유저 수정 - 프로필 이미지 수정과 비밀번호 변경은 별개로 진행되도록 처리함
const updateUser = async(
  userId: number, 
  data: { 
    email: string,
    name: string, 
    currentPassword?: string,
    newPassword?: string,
    profileImage?: string | null }) => {
  // 비밀번호 변경
    const user = await userRepo.getUserRepository(userId);
  if (!user) {
    throw new createError.NotFound('유저를 찾을 수 없습니다.');
  }
  if (data.currentPassword && data.newPassword) {
  const isMatch = await auth.verifyPassword(data.currentPassword, user.password!);
  if (!isMatch) {
    throw new createError.Unauthorized('이메일 또는 비밀번호가 잘못되었습니다.');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);
  data.newPassword = hashedNewPassword;
  }
  // 프로필 이미지 수정
  const updatedUser = await userRepo.updateUserRepository(userId, {
    email: data.email ?? user.email,
    name: data.name ?? user.name,
    password: data.newPassword ? data.newPassword : (user as any).password,
    profileImage:
      data.profileImage === undefined ? user.profileImage : data.profileImage,
  });

  return updatedUser;
};

// // 유저 프로젝트 조회
// const getUserProjects = async (
//   userId: number,
//   sort: "latest" | "name" = "latest"
// ) => {
//   const projects = await repo.getUserProjectsRepo(userId, sort);
//   const data = projects.map((p:any) => ({
//     id: p.id,
//     name: p.name,
//     description: p.description ?? "",
//     memberCount: p.members.length,
//     todoCount: p.tasks?.filter((t:any) => t.status === "TODO").length ?? 0,
//     inProgressCount:
//       p.tasks?.filter((t:any) => t.status === "IN_PROGRESS").length ?? 0,
//     doneCount: p.tasks?.filter((t:any) => t.status === "DONE").length ?? 0,
//     createdAt: p.createdAt,
//     updatedAt: p.updatedAt,
//   }));

//   return {
//     data,
//     total: data.length,
//   };
// };

// 유저 프로젝트 조회
const getUserProjects = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
  orderBy: "name" | "created_at" = "created_at",
) => {
  const offset = (page - 1) * limit;

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
  >` SELECT 
      p.id ,
      p.name As name,
      p.description As description,
      COUNT(DISTINCT pm.id) ::INT AS "memberCount",
      SUM(CASE WHEN t.status = 'TODO' THEN 1 ELSE 0 END) ::INT AS "todoCount",
      SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) ::INT AS "inProgressCount",
      SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END) ::INT AS "doneCount",
      p."createdAt" AS "createdAt",
      p."updatedAt" AS "updatedAt"
    FROM "Project" AS p
    LEFT JOIN "ProjectMember" AS pm ON pm."projectId" = p.id
    LEFT JOIN "Task" AS t ON t."projectId" = p.id
    WHERE pm."userId" = ${userId} OR p."ownerId" = ${userId}
    GROUP BY p.id
    ORDER BY p.${Prisma.raw(orderBy === 'name' ? '"name" ASC' : '"createdAt" DESC')}
    LIMIT ${limit} OFFSET ${offset}
  `;
  console.log(result);
    return {data:result, total: result.length};

};


export default {
  createUsers,
  getUser,
  updateUser,
  getUserProjects
};