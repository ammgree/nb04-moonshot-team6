import prisma from "../configs/prisma.js";
import bcrypt from "bcrypt";

// 회원가입 레포지토리
export const createUserRepository = (
  data: { email: string; name: string; password: string, profileImage?: string }
) => {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      profileImage: data.profileImage || null,
    },
  });
};

// 유저 조회 레포지토리
export const getUserRepository = (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

// 유저 수정 레포지토리
export const updateUserRepository = async (
  userId: number,
  data: { email : string, name: string, password: string, profileImage?: string | null }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { email: data.email,
            name: data.name,
            password: data.password,
            profileImage: data.profileImage ? data.profileImage : null
          },
  });
};

export default {
  createUserRepository,
  getUserRepository,
  updateUserRepository,
};