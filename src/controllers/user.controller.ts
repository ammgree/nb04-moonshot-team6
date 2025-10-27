import service from "../services/user.service.js";
import type { Request, Response } from "express";

// 회원가입 컨트롤러
const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await service.createUsers({ ...req.body });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 유저 조회 컨트롤러
const getUserController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const user = await service.getUser(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 유저 수정 컨트롤러
const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const updatedUser = await service.updateUser(userId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  createUserController,
  getUserController,
  updateUserController,
};
