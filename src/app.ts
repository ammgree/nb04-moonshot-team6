import express from "express";
import type { Express } from "express";
import dotenv from "dotenv";
import taskRouter from "./routes/task.router.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/projects", taskRouter);
app.use("/tasks", taskRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
