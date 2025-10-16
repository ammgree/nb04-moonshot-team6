import prisma from "../configs/prisma.js";

export const createUser = (
  data: { email: string; name: string; password: string }
) => {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
    },
  });
};

export default {
  createUser,
};