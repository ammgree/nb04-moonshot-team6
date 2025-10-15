import express from "express";
import ProjectRouter from "../routes/project.route.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send();
});

router.use("/", ProjectRouter);

export default router;
