import type { InvitationStatus } from "@prisma/client";
import * as memberRepo from "../repositories/member.repository.js";
import { BadRequestError, NotFoundError } from "utils/error.js";

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
  return inviteLink;
}

// 초대 수락
export async function acceptInvitation(invitationId: string, userId: number) {
  const invitation = await memberRepo.findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("유효하지 않은 초대입니다.");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("이미 처리된 초대입니다.");
  }
  await memberRepo.createProjectMember(invitation.projectId, userId);
  await memberRepo.updateInvitationStatus(
    invitationId,
    "ACCEPTED" as InvitationStatus
  );
  return { message: "초대가 수락되었습니다." };
}

// 초대 취소
export async function deleteInvitation(invitationId: string) {
  const invitation = await memberRepo.findInvitationById(invitationId);
  if (!invitation) {
    throw new NotFoundError("유효하지 않은 초대입니다.");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("이미 처리된 초대입니다.");
  }
  await memberRepo.deleteInvitation(invitationId);
}
