import type { InvitationStatus } from "@prisma/client";
import * as memberRepo from "../repositories/member.repository.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error.js";

// 이메일 전송을 위한 nodemailer 설정
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { email_service, user, pass } = process.env;

const transporter = nodemailer.createTransport({
  service: email_service,
  auth: {
    user: user,
    pass: pass,
  },
});

// 프로젝트 멤버 조회
export async function getMembers(
  page: number,
  limit: number,
  projectId: number
) {
  const members = await memberRepo.getMembers(page, limit, projectId);
  const invitations = await memberRepo.getInvitations(projectId);
  const data = members.map((item) => {
    const invite = invitations.find((inv) => inv.email === item.user.email);
    return {
      id: item.user.id,
      name: item.user.name,
      email: item.user.email,
      profileImage: item.user.profileImage,
      taskCount: item.user.tasksAssigned.length,
      status: invite?.status || "ACCEPTED",
      invitationId: invite?.invitationId || null,
    };
  });

  return {
    data,
    total: data.length,
  };
}

// 프로젝트에서 유저 제외
export async function deleteMember(projectId: number, userId: number) {
  await memberRepo.deleteMember(projectId, userId);
  await memberRepo.updateStatus(projectId);
}

// 프로젝트에 멤버 초대
export async function inviteMember(
  projectId: number,
  email: string,
  invitationId: string
) {
  const existing = await memberRepo.findInvitation(projectId, email);
  if (existing) {
    throw new BadRequestError("이미 초대된 이메일입니다.");
  }
  await memberRepo.createInvitation(projectId, email, invitationId);
  const inviteLink =
    "http://localhost:3000/invitations/" + invitationId + "/accept";
  console.log(inviteLink);

  const mailOptions = {
    from: user,
    to: email,
    subject: "프로젝트 초대 링크입니다.",
    html: `<h2>프로젝트 초대 링크입니다.</h2>
    <p>아래 링크를 클릭하여 초대를 수락하세요.</p>
    <a href="${inviteLink}">초대 수락</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("이메일 전송 실패", error);
    } else {
      console.log("이메일 전송 성공", info);
    }
  });
  return inviteLink;
}

// 초대 수락
export async function acceptInvitation(invitationId: string, userId: number) {
  if (!userId) {
    throw new UnauthorizedError("로그인이 필요합니다.");
  }
  const invitation = await memberRepo.findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("유효하지 않은 초대입니다.");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("이미 처리된 초대입니다.");
  }
  const user = await memberRepo.findUserById(userId);
  if (!user) {
    throw new NotFoundError("유효하지 않은 사용자입니다.");
  }
  if (invitation.email !== user.email) {
    throw new ForbiddenError("권한이 없습니다.");
  }
  await memberRepo.createProjectMember(invitation.projectId, userId);
  await memberRepo.updateInvitationStatus(
    invitationId,
    "ACCEPTED" as InvitationStatus
  );
  return { message: "초대가 수락되었습니다." };
}

// 초대 취소
export async function cancelInvitation(invitationId: string) {
  const invitation = await memberRepo.findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("유효하지 않은 초대입니다.");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("이미 처리된 초대입니다.");
  }
  await memberRepo.cancelInvitation(invitationId);
}
