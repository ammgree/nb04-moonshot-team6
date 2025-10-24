import type { Request, Response, NextFunction } from "express";
import { AppError, getErrorMessage } from "../utils/error.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: getErrorMessage(err),
    });
  }

  // 예상치 못한 에러 처리
  res.status(500).json({
    message: "서버 내부 오류가 발생했습니다",
  });
};
