import type { User as PrismaUser } from "@prisma/client";

// 글로벌 Request 확장

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        [key: string]: any;
      };
    }
  }
}