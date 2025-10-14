import express from 'express';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

// 회원가입
app.use('/', userRouter);

// 로그인
app.use('/', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
