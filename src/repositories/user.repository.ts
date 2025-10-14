import prisma from "../configs/prisma.js";
import type { User } from "@prisma/client";

export default {
    findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
    findById: (id: number) => prisma.user.findUnique({ where: { id } }),
    findByGoogleId: (googleId: string) => prisma.user.findUnique({ where: { googleId } }),
    create: (data: Partial<User>) => prisma.user.create({ data: data as any }),
    update: (id: number, data: Partial<User>) => prisma.user.update({ where: { id }, data: data as any }),
};