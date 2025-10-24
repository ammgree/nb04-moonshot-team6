import type { InvitationStatus } from "@prisma/client";
import prisma from "../configs/prisma.js";

// 프로젝트 멤버 조회
export async function getMembers(
  page: number,
  limit: number,
  projectId: number
) {
  return await prisma.projectMember.findMany({
    where: { projectId },
    take: limit,
    skip: (page - 1) * limit,
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          tasksAssigned: true,
        },
      },
    },
  });
}

// 해당 프로젝트의 초대 목록 조회
export async function getInvitations(projectId: number) {
  return await prisma.invitation.findMany({
    where: { projectId, invitationId: { not: null } },
    select: {
      id: true,
      email: true,
      status: true,
      invitationId: true,
    },
  });
}

// 프로젝트에서 유저 제외
export async function deleteMember(projectId: number, userId: number) {
  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
}

// 멤버 제외 후 invitation status 바꾸기
export async function updateStatus(projectId: number) {
  return await prisma.invitation.updateMany({
    where: { projectId, status: "ACCEPTED" },
    data: { invitationId: null, status: "PENDING" },
  });
}

// projectId와 email로 초대 여부 확인
export async function findInvitation(projectId: number, email: string) {
  return await prisma.invitation.findFirst({
    where: {
      projectId,
      email,
      invitationId: {
        not: null,
      },
    },
  });
}

// 초대 생성
export async function createInvitation(
  projectId: number,
  email: string,
  invitationId: string
) {
  return await prisma.invitation.create({
    data: {
      projectId,
      email,
      invitationId,
    },
  });
}

// 초대 ID로 초대 여부 확인
export async function findInvitationById(invitationId: string) {
  return await prisma.invitation.findFirst({
    where: { invitationId },
  });
}

// 프로젝트 멤버로 추가
export async function createProjectMember(projectId: number, userId: number) {
  return await prisma.projectMember.create({
    data: { projectId, userId },
  });
}

// 초대 상태 업데이트
export async function updateInvitationStatus(
  invitationId: string,
  status: InvitationStatus
) {
  return await prisma.invitation.updateMany({
    where: { invitationId },
    data: { status },
  });
}

// 초대 취소
export async function cancelInvitation(invitationId: string) {
  return await prisma.invitation.updateMany({
    where: { invitationId },
    data: {
      invitationId: null,
    },
  });
}

// userId로 유저 찾기
export async function findUserById(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}
