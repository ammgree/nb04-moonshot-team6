import * as repo from "../repositories/project.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import auth from '../middlewares/auth.middleware.js';
import bcrypt from 'bcrypt';
import prisma from '../configs/prisma.js';
import type { Request, Response } from 'express';
import express from 'express';
import createError  from 'http-errors';
import { uploadBuffer } from '../services/upload.service.js';

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
  const user = await userRepo.createUser({
    email: userData.email,
    name: userData.name,
    password: hashedPassword,
    profileImage: userData.profileImage,
  });
  return user;
};

// 유저 조회
const getUser = async(req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ errorMessage: '토큰이 만료되었습니다.' });
  }
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  res.status(200).json(user);
};

// 유저 수정
const updateUser = async(req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).send({ errorMessage: '토큰이 만료되었습니다.' });
  }
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return res.status(404).send({ errorMessage: '유저를 찾을 수 없습니다.' });
  }
  const isMatch = await auth.verifyPassword(req.body.currentPassword, user.password!);
  if (!isMatch) {
    throw { status: 401, message: '이메일 또는 비밀번호가 잘못되었습니다.' };
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { email: req.body.email,
            name: req.body.name,
            password: req.body.newPassword ? await bcrypt.hash(req.body.newPassword, 10) : user.password,
            profileImage: req.body.profileImage ? req.body.profileImage : user.profileImage
          },
  });
  res.status(200).json(updatedUser);
};

// 유저 프로젝트 조회
export const getUserProjects = async (
  userId: number,
  sort: "latest" | "name" = "latest"
) => {
  const projects = await repo.getUserProjectsRepo(userId, sort);
  const data = projects.map((p:any) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    memberCount: p.members.length,
    todoCount: p.tasks?.filter((t:any) => t.status === "TODO").length ?? 0,
    inProgressCount:
      p.tasks?.filter((t:any) => t.status === "IN_PROGRESS").length ?? 0,
    doneCount: p.tasks?.filter((t:any) => t.status === "DONE").length ?? 0,
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
  updateUser,
  getUserProjects
};