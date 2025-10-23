import type { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends Partial<PrismaUser> {}
    interface Request {
      user?: User;
    }
  }
}
