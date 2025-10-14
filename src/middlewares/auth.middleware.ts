import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export async function authMiddlewere(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "토큰이 없습니다. "});
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 잘못되었습니다." });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRETE as string) as JwtPayload;

  req.user = decoded as { id: number };
  next();
} catch (error) {
  res.status(401).json({ message: "유효하지 않은 토큰입니다. "});
}
}