import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import dotenv from 'dotenv'
import {
  UserNotFoundError 
} from '../utils/error.js';

const app = express();
app.use(express.json());
dotenv.config();

// 토큰 생성 함수
const createToken = (user: { id: number }, type?: string) => {
  const payload = { id: user.id };
  const options: jwt.SignOptions = {
    expiresIn: type === 'refresh' ? '2w' : '1h'
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export default {
    createToken,
    async verifyPassword(
        inputPassword: string, 
        password: string
    ): Promise<boolean> {
        try {
            return await bcrypt.compare(inputPassword, password);
        } catch (error) {
            throw UserNotFoundError;
        }
    },
    
    // 비밀번호 해시
    async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
    },
}