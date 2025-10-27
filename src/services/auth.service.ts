import prisma from "../configs/prisma.js";
import express from "express";
import auth from "../middlewares/auth.middleware.js";
import ms from "ms";
import userRepo from "../repositories/user.repository.js";
import authRepo from "../repositories/auth.repository.js";
import auth_middleware from "../middlewares/auth.middleware.js";
import { UserNotFoundError, SignUpError } from "../utils/error.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import {
  REFRESH_TOKEN_EXPIRES_DAYS,
  ACCESS_TOKEN_EXPIRES_IN,
} from "../utils/constants.js";

const app = express();
app.use(express.json());

// 로그인 서비스
const getLogin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw { status: 401, message: "이메일 또는 비밀번호가 잘못되었습니다." };
  }

  const isMatch = await auth.verifyPassword(password, user.password!);
  if (!isMatch) {
    throw { status: 401, message: "이메일 또는 비밀번호가 잘못되었습니다." };
  }
  // 토큰 발급
  // const accessToken = auth.createToken(user);
  // const refreshToken = auth.createToken(user, "refresh");

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  // 기존 refreshToken 모두 폐기
  await authRepo.revokeById(user.id);

  const expiresAt = new Date(Date.now() + (REFRESH_TOKEN_EXPIRES_DAYS));
  // DB에 새로 발급한 refreshToken 저장

  await authRepo.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

export default {
  getLogin,

// 구글 로그인
  async signInWithGoogle(
    profile: {
      email: string;
      googleId: string;
      name?: string;
      picture?: string;
    },
    meta?: { ip?: string; device?: string }
  ) {
    let user = await userRepo.findByGoogleId(profile.googleId);
    if (!user) {
      user = await userRepo.create({
        email: profile.email,
        googleId: profile.googleId,
        name: profile.name ?? null,
        profileImage: profile.picture ?? null,
      });
    }
    // const accessToken = auth.createToken(user);
    // const refreshToken = auth.createToken(user, "refresh");

    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    const expiresAt = new Date(Date.now() + ms(ACCESS_TOKEN_EXPIRES_IN));

    await authRepo.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      ip: meta?.ip ?? null,
      device: meta?.device ?? null,
      expiresAt,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  // 토큰 재발급
  async refreshAccessToken(token: string) {
    const stored = await authRepo.findByToken(token);
    if (!stored || stored.revoked)
      throw new Error("유효하지 않은 리프레시 토큰입니다.");

    const accessToken = signAccessToken({ userId: stored.userId });
    const newRefreshToken = signRefreshToken({ userId: stored.userId });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await authRepo.createRefreshToken({
      token: newRefreshToken,
      userId: stored.userId,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },
};