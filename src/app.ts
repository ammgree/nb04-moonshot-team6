import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import uploadRouter from "./routes/upload.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import projectRouter from "./routes/project.route.js";
import taskRouter from "./routes/task.router.js";
import subtaskRouter from "./routes/subtask.router.js";
import memberRouter from "./routes/member.route.js";
import commentRouter from "./routes/comment.route.js"
import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import { errorHandler } from "./middlewares/error.middleware.js";
import passport from "./configs/passport.js";
import dotenv from "dotenv";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import './configs/cron.js';

const app = express();
app.use(express.json({ limit: "10mb" }));

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "https://nb04-moonshot-team6-front.onrender.com",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
// app.use(passport.session());

app.use("/", uploadRouter); // 파일 업로드

app.use("/", authRouter); // 인증

app.use("/", userRouter); // 유저

app.use("/", projectRouter); // 프로젝트

app.use("/", taskRouter); // 할일

app.use("/", subtaskRouter); // 하위 할일

app.use("/", dashboardRouter); // 대쉬보드 칸반

app.use("/", memberRouter); // 멤버

app.use("/", commentRouter); // 댓글


app.use("/", router);

// 404처리
app.use((req, res, next) => {
  res.status(404).json({ error: "존재하지 않는 주소입니다." });
});

// 에러 핸들러 미들웨어
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
