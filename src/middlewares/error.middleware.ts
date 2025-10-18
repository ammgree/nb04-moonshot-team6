import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(" Error caught by global handler:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "서버 내부 오류가 발생했습니다.";

  res.status(status).json({
    success: false,
    message,
  });
}