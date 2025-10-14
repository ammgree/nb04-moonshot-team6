import bcrypt from "bcrypt";
import ms from "ms";
import prisma from "../configs/prisma.js";
import userRepo from "../repositories/user.repository.js";
import authRepo from "../repositories/auth.repository.js";
import auth_middleware from '../middlewares/auth.middleware.js';
import {
  UserNotFoundError,
  SignUpError
} from '../utils/error.js'
import {
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt.js";
import { REFRESH_TOKEN_EXPIRES_DAYS , ACCESS_TOKEN_EXPIRES_IN, GOOGLE_USERINFO_URL } from "../utils/constants.js";

export default {
  async register(userData: {email: string, password : string, name: string, profileImage: string;}) {
    const existing = await userRepo.findByEmail(userData.email);
    if (existing) {
      throw SignUpError
    }

    const hashedPassword = await auth_middleware.hashPassword(userData.password);
    
    const user = await userRepo.create({
        ...userData,
        password: hashedPassword
    });

    return {
      user
    };
  },

  async login(email: string, password: string) {

    const user = await prisma.user.findUnique({
      where: { email }, 
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    await auth_middleware.verifyPassword(password, user.password!);

    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    await authRepo.revokeById(user.id);

    const expiresAt = new Date(Date.now() + ms(ACCESS_TOKEN_EXPIRES_IN));

    await authRepo.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  // 구글 로그인
  async signInWithGoogle(profile: { email: string; googleId: string; name?: string; picture?: string }, meta?: { ip?: string; device?: string }) {
    let user = await userRepo.findByGoogleId(profile.googleId);
    if (!user) {
        user = await userRepo.create({
            email: profile.email,
            googleId: profile.googleId,
            name: profile.name ?? null,           
            profileImage: profile.picture ?? null 
        });
    }

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
    if (!stored || stored.revoked) throw new Error("유효하지 않은 리프레시 토큰입니다.");

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
