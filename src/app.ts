import express from "express";

import memberRouter from "./routes/member.route.js";

const app = express();
app.use(express.json());

app.use("/", memberRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행됨: http://localhost:${PORT}`);
});
