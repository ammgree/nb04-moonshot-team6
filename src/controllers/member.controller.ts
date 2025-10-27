import type { Request, Response } from "express";
import * as memberService from "../services/member.service.js";
import { randomUUID } from "crypto";
import {
  AppError,
  getErrorMessage,
  UnauthorizedError,
} from "../utils/error.js";

// 프로젝트 멤버 조회
export async function getMembers(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }
    const projectId = Number(req.params.projectId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await memberService.getMembers(
      page,
      limit,
      projectId,
      user.id!
    );
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
}

// 프로젝트에서 유저 제외
export async function deleteMember(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    const memberId = Number(req.params.userId);
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }
    await memberService.deleteMember(projectId, memberId, user.id!);
    res.status(200).json({ message: "success" });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
}

// 프로젝트에 멤버 초대
export async function inviteMember(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }

    const projectId = Number(req.params.projectId);
    const { email } = req.body;
    const invitationId = randomUUID();
    const result = await memberService.inviteMember(
      projectId,
      email,
      invitationId,
      user.id!
    );
    res.status(200).json({ "초대 링크": result });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
}

// 초대 수락
export async function acceptInvitation(req: Request, res: Response) {
  try {
    const invitationId = req.params.invitationId!;
    const userId = Number(req.body.userId); // 임시로 userId를 body로 받음
    const result = await memberService.acceptInvitation(invitationId, userId);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
}

// 초대 취소
export async function cancelInvitation(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("로그인이 필요합니다.");
    }
    const invitationId = req.params.invitationId!;
    await memberService.cancelInvitation(invitationId, user.id!);
    res.status(200).json({ message: "초대가 취소되었습니다." });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: getErrorMessage(err) });
    }
  }
}
