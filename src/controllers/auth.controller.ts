import type { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//회원가입
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name, profileImage } = req.body;

    // 서비스 레이어 호출
    const result = await userService.createUsers({
      email,
      password,
      name,
      profileImage,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// 로그인
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const userAgent = req.headers["user-agent"];

    const result = await authService.getLogin(email, password);

    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// 토큰 갱신
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res
      .status(200)
      .json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
  } catch (err) {
    next(err);
  }
}
