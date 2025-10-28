import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import { errorHandler } from "./middlewares/error.middleware.js";
import passport from "./configs/passport.js";
import dotenv from "dotenv";
import router from "./routes/index.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

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
