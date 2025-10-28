import prisma from "../configs/prisma.js";
import type { RefreshToken } from '@prisma/client';


export default {
    createRefreshToken: (data: Partial<RefreshToken>) => prisma.refreshToken.create({ data: data as any }),
    findByToken: (token: string) => prisma.refreshToken.findUnique({ where: { token, revoked: false } }),
    revokeById: (userId: number) => prisma.refreshToken.updateMany({where: { userId }, data: { revoked: true }, }),
    deleteByUser: (userId: number) => prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
};