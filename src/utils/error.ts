export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // V8 환경에서 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export class SignUpError extends AppError {
  constructor(message: string = "이미 가입한 이메일입니다.") {
    super(message, 400);
  }
}
export class BadRequestError extends AppError {
  constructor(message: string = "잘못된 요청입니다") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "로그인이 필요합니다") {
    super(message, 401);
  }
}

export class UserNotFoundError extends AppError {
  constructor(message: string = "존재하지 않거나 비밀번호가 일치하지 않습니다") {
    super(message , 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "권한이 없습니다") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "리소스를 찾을 수 없습니다") {
    super(message, 404);
  }
}

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};
