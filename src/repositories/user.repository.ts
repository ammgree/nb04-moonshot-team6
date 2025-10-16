import prisma from "../configs/prisma.js";

// 회원가입 레포지토리
export const createUser = (
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

export default {
  createUser,
};