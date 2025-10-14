import service from "../services/auth.service.js";;
import type { Request, Response } from "express";

// 로그인 컨트롤러
export const getUserLoginController = async (
  req: Request,
  res: Response
) => {
    const { email, password } = req.body;
    const login = await service.getLogin(email, password);
    res.status(200).json(login);
};

export default {
  getUserLoginController,
};