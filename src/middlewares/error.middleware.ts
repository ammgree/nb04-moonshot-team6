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


// 에러 클래스
// class AppError extends Error {
//   constructor(message:string, statusCode = 500, isOperational = true, cause = null) {
//     super(message);
//     this.name = this.constructor.name;  // 예: “ValidationError”
//     this.statusCode = statusCode;       // HTTP API 등에서 쓸 수 있는 코드
//     this.isOperational = isOperational; // 운영상 정상처리 가능한 에러인지 여부
//     this.cause = cause;                 // 내부 에러가 있다면 감싸서 전달 가능
//     Error.captureStackTrace(this, this.constructor);
//   }
// }