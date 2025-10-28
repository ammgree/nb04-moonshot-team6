import type { InvitationStatus } from "@prisma/client";
import * as memberRepo from "../repositories/member.repository.js";
import prisma from "../configs/prisma.js";
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
  projectId: number,
  userId: number
) {
  const ismember = await memberRepo.findProjectMember(projectId, userId);
  if (!ismember) {
    throw new ForbiddenError("프로젝트 멤버가 아닙니다.");
  }
  // 현재 멤버
  const members = await memberRepo.getMembers(page, limit, projectId);
  // 초대 중
  const invitations = await memberRepo.getInvitations(projectId);
  const invitedEmails = invitations.map((inv) => inv.email);
  const invitedUser = await memberRepo.findUsersByEmail(invitedEmails);

  const combined = [...members, ...invitedUser];
  const data = combined.map((item) => {
    const user = "user" in item ? item.user : item;
    const invite = invitations.find((inv) => inv.email === user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      taskCount: user.tasksAssigned.length,
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
export async function deleteMember(
  projectId: number,
  memberId: number,
  userId: number
) {
  const member = await memberRepo.findProjectMember(projectId, memberId);
  if (!member) {
    throw new NotFoundError("해당 프로젝트의 멤버가 아닙니다.");
  }
  const owner = await memberRepo.findProjectOwner(projectId);
  if (userId !== owner?.id) {
    throw new ForbiddenError("프로젝트 관리자가 아닙니다.");
  }
  await memberRepo.deleteMember(projectId, memberId);
  await memberRepo.updateStatus(projectId);
}

// 프로젝트에 멤버 초대
export async function inviteMember(
  projectId: number,
  email: string,
  invitationId: string,
  userId: number
) {
  const owner = await memberRepo.findProjectOwner(projectId);
  if (userId !== owner?.id) {
    throw new ForbiddenError("프로젝트 관리자가 아닙니다.");
  }

  const existing = await memberRepo.findInvitation(projectId, email);
  if (existing) {
    throw new BadRequestError("이미 초대된 이메일입니다.");
  }
  await memberRepo.createInvitation(projectId, email, invitationId, userId);
  const inviteLink =
    "http://localhost:3001/invitations/" + invitationId + "/accept";
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
export async function acceptInvitation(
  invitationId: string, 
//  userId: number
) {
  // if (!userId) {
  //   throw new UnauthorizedError("로그인이 필요합니다.");
  // }
  // const invitation = await memberRepo.findInvitationById(invitationId);
  // if (!invitation) {
  //   throw new NotFoundError("유효하지 않은 초대입니다.");
  // }
  // if (invitation.status !== "PENDING") {
  //   throw new BadRequestError("이미 처리된 초대입니다.");
  // }
  // const user = await memberRepo.findUserById(userId);
  // if (!user) {
  //   throw new NotFoundError("유효하지 않은 사용자입니다.");
  // }
  // if (invitation.email !== user.email) {
  //   throw new ForbiddenError("권한이 없습니다.");
  // }
// invitation의 email 값을 가지고 user id를 얻는 코드
const invitation = await prisma.invitation.findFirst({
  where: { invitationId: invitationId }, // invitationId는 인바이트의 PK 값
});

const user = await prisma.user.findUnique({
  where: { email: invitation!.email },
});
  await memberRepo.createProjectMember(invitation!.projectId, user!.id);
  await memberRepo.updateInvitationStatus(
    invitationId,
    "ACCEPTED" as InvitationStatus
  );
  return `
      <html>
        <head><title>초대 수락 완료</title></head>
        <body>
          <h1>초대가 수락되었습니다.</h1>
          <p>프로젝트에 성공적으로 참여하셨습니다.</p>
          <a href="/projects/${invitation!.projectId}">프로젝트 페이지로 이동</a>
        </body>
      </html>
    `;;
}

// 초대 취소
export async function cancelInvitation(invitationId: string, userId: number) {
  const invitation = await memberRepo.findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("유효하지 않은 초대입니다.");
  }
  if (invitation.invitedBy !== userId) {
    throw new ForbiddenError("권한이 없습니다.");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("이미 처리된 초대입니다.");
  }
  await memberRepo.cancelInvitation(invitationId);
  await memberRepo.updateInvitationStatus(
    invitationId,
    "REJECTED" as InvitationStatus
  );
}
