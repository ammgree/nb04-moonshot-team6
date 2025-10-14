import express from "express";
import type { Express } from "express";
import dotenv from "dotenv";
import taskRouter from "./routes/task.router.js";
import subtaskRouter from "./routes/subtask.router.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/projects", taskRouter);
app.use("/tasks", taskRouter);
app.use("/subtasks", subtaskRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
