import * as repo from "../repositories/project.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../utils/error.js";
import nodemailer from "nodemailer";
import fs from "fs";
import sgMail from "@sendgrid/mail"
// import {
//   DEFAULT_PAGE,
//   MIN_PAGESIZE,
//   MAX_PAGESIZE,
// } from "../utils/constants.js";

// -------------------------
// 프로젝트 생성
// -------------------------
export const createProject = async (
  userId: number,
  data: { name: string; description?: string }
) => {
  if (!userId || isNaN(userId))
    throw new UnauthorizedError("로그인이 필요합니다");

  if (!data.name || typeof data.name !== "string") {
    throw new BadRequestError("잘못된 데이터 형식");
  }

  const count = await repo.countUserProjects(userId);
  if (count >= 5)
    throw new BadRequestError("유저당 최대 5개의 프로젝트만 생성 가능합니다.");
  const project = await repo.createProjectRepo(userId, data);

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    memberCount: project.members.length,
    todoCount: project.tasks?.filter((t) => t.status === "TODO").length ?? 0,
    inProgressCount:
      project.tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    doneCount: project.tasks?.filter((t) => t.status === "DONE").length ?? 0,
  };
};

// -------------------------
// 프로젝트 목록 조회
// -------------------------

export const getUserProjects = async (
  userId: number,
  limit: number = 10,
  offset: number = 0,
  orderBy: "name" | "createdAt" = "createdAt",
  order: "asc" | "desc" = "desc",
) => {
  const projects = await repo.getUserProjectsRepo(userId, limit, offset, orderBy, order);
  const data = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    memberCount: p.members.length,
    todoCount: p.tasks?.filter((t) => t.status === "TODO").length ?? 0,
    inProgressCount:
      p.tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    doneCount: p.tasks?.filter((t) => t.status === "DONE").length ?? 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
  return {
    data,
    total: data.length,
  };
};

// -------------------------
// 프로젝트 상세 조회
// -------------------------
export const getProjectById = async (userId: number, projectId: number) => {
  if (!userId || isNaN(userId)) {
    throw new UnauthorizedError("로그인이 필요합니다"); // 401
  }

  const project = await repo.findProjectById(projectId); // 단일 프로젝트 조회
  if (!project) {
    throw new NotFoundError("프로젝트를 찾을 수 없습니다."); // 404
  }

  const isMember = project.members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new ForbiddenError("프로젝트 멤버가 아닙니다"); // 403
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "", // null 방지
    memberCount: project.members.length,
    todoCount: project.tasks?.filter((t) => t.status === "TODO").length ?? 0,
    inProgressCount:
      project.tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    doneCount: project.tasks?.filter((t) => t.status === "DONE").length ?? 0,
  };
};

// -------------------------
// 프로젝트 수정
// -------------------------
export const updateProject = async (
  userId: number,
  projectId: number,
  data: { name?: string; description?: string }
) => {
  if (!userId || isNaN(userId))
    throw new UnauthorizedError("로그인이 필요합니다");
  const project = await repo.findProjectById(projectId);
  if (!project) throw new NotFoundError("프로젝트를 찾을 수 없습니다.");
  if (project.ownerId !== userId)
    throw new ForbiddenError("프로젝트 관리자가 아닙니다");

  const updatedProject = await repo.updateProjectRepo(projectId, data);

  return {
    id: updatedProject.id,
    name: updatedProject.name,
    description: updatedProject.description ?? "",
    memberCount: updatedProject.members.length,
    todoCount:
      updatedProject.tasks?.filter((t) => t.status === "TODO").length ?? 0,
    inProgressCount:
      updatedProject.tasks?.filter((t) => t.status === "IN_PROGRESS").length ??
      0,
    doneCount:
      updatedProject.tasks?.filter((t) => t.status === "DONE").length ?? 0,
  };
};

// -------------------------
// 프로젝트 삭제
// -------------------------


// 테스트/프로덕션 공용 sendMail 함수
const sendMailSafe = async (options: {
  from: string;
  to?: string;
  subject: string;
  text: string;
}) => {  
  return sgMail.send(options);
  } 

export const deleteProject = async (userId: number, projectId: number) => {
  if (!userId || isNaN(userId))
    throw new UnauthorizedError("로그인이 필요합니다");
  if (!projectId || isNaN(projectId)) {
    throw new BadRequestError("잘못된 데이터 형식");
  }
  const project = await repo.findProjectById(projectId);
  if (!project) throw new NotFoundError("프로젝트를 찾을 수 없습니다.");
  if (project.ownerId !== userId)
    throw new ForbiddenError("프로젝트 관리자가 아닙니다");

  // 멤버에게 알림 메일 발송
  await Promise.all(
    project.members
      .filter((member) => member.userId !== userId)
      .map((member) =>
        sendMailSafe({
          from: `"Moonshot" <${process.env.SMTP_USER}>`,
          ...({
            to: member.user.email,
          }),
          subject: `프로젝트 "${project.name}" 삭제 안내`,
          text: `참여 중인 프로젝트 "${project.name}"가 삭제되었습니다.`,
        })
      )
  );

  return repo.deleteProjectRepo(projectId);
};
