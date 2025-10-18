import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import commentRouter from './routes/comment.route.js';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from 'middlewares/error.middleware.js';
const router = express.Router();

dotenv.config();

const app = express();

app.use(express.json());

app.use("/", commentRouter);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`서버가 ${port}에서 실행중입니다.`)
});