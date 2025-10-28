import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import uploadRouter from "./upload.route.js";
import dashboardRouter from "./dashboard.route.js";
import projectRouter from "./project.route.js";
import taskRouter from "./task.router.js";
import subtaskRouter from "./subtask.router.js";
import memberRouter from "./member.route.js";
import commentRouter from "./comment.route.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send();
});

router.use("/", uploadRouter); // 파일 업로드

router.use("/", authRouter); // 인증

router.use("/", userRouter); // 유저

router.use("/", projectRouter); // 프로젝트

router.use("/", taskRouter); // 할일

router.use("/", subtaskRouter); // 하위 할일

router.use("/", dashboardRouter); // 대쉬보드 칸반

router.use("/", memberRouter); // 멤버

router.use("/", commentRouter); // 댓글

export default router;
