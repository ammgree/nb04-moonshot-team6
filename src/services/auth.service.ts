import prisma from '../configs/prisma.js';
import express from 'express';
import auth from '../middlewares/auth.middleware.js';

const app = express();
app.use(express.json());

// 로그인 서비스
const getLogin = async(email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw { status: 401, message: '이메일 또는 비밀번호가 잘못되었습니다.' };
  }
  const isMatch = await auth.verifyPassword(password, user.password!);
  if (!isMatch) {
    throw { status: 401, message: '이메일 또는 비밀번호가 잘못되었습니다.' };
  }
  const accessToken = auth.createToken(user);
  const refreshToken = auth.createToken(user, 'refresh');

  // 기존 refreshToken 모두 폐기
  await prisma.refreshToken.updateMany({
  where: { userId: user.id },
  data: { revoked: true } 
  });

  // DB에 새로 발급한 refreshToken 저장
  await prisma.refreshToken.create({
    data: { 
      userId: user.id, 
      token: refreshToken,
      expiresAt: new Date(Date.now() + 14*24*60*60*1000) // 2주
    } 
  });
  return { accessToken, refreshToken };
};

export default {
  getLogin,
};