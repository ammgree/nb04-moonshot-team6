import bcrypt from 'bcrypt';
import { expressjwt } from 'express-jwt';
import express from 'express';
import {
  UserNotFoundError 
} from '../utils/error.js'

const app = express();
app.use(express.json());

export default {
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