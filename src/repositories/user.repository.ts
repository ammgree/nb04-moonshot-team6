import prisma from "../configs/prisma.js";
import type { User } from "@prisma/client";

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
    findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
    findById: (id: number) => prisma.user.findUnique({ where: { id } }),
    findByGoogleId: (googleId: string) => prisma.user.findUnique({ where: { googleId } }),
    create: (data: Partial<User>) => prisma.user.create({ data: data as any }),
    update: (id: number, data: Partial<User>) => prisma.user.update({ where: { id }, data: data as any }),
};