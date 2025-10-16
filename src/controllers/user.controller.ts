import service from "../services/user.service.js";;
import type { Request, Response } from "express";

// 회원가입 컨트롤러
export const createUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await service.createUsers(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  createUserController,
};