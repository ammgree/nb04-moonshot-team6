import { User, Task, Comment } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    // Prisma User 타입, JWT payload, 혹은 단순 ID 객체 가능
    user?: User | { id: number } | JwtPayload;

    // Task 타입 혹은 최소 id 정보
    task?: Task | { id: number };

    // Comment 타입
    comment?: Comment;
  }
}

export {};