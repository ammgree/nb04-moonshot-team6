import express from "express";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import uploadRouter from "./routes/upload.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import projectRouter from "./routes/project.route.js";
import taskRouter from "./routes/task.router.js";
import subtaskRouter from "./routes/subtask.router.js";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import "./configs/passport.js";
import { logger } from "./utils/logger.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(morgan("dev"));
app.use(errorHandler);

// 유저 관련 라우터
app.use("/", userRouter);

// 인증
app.use("/", authRouter);

// 프로젝트
app.use("/", projectRouter);

app.use("/", taskRouter);
app.use("/", subtaskRouter);

// 파일 업로드
app.use("/", uploadRouter);

// 대시보드 (칸반, 캘린더)
app.use("/", dashboardRouter);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate("jwt", { session: false }));

// ✅ Auth routes
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
