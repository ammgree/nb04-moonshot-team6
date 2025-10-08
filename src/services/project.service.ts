import * as repo from "../repositories/project.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../utils/error.js";
import nodemailer from "nodemailer";
import fs from "fs";

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
  sort: "latest" | "name" = "latest"
) => {
  if (!userId || isNaN(userId))
    throw new UnauthorizedError("로그인이 필요합니다");
  if (sort !== "latest" && sort !== "name") {
    throw new BadRequestError("잘못된 요청입니다"); // 400
  }

  const projects = await repo.getUserProjectsRepo(userId, sort);

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

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === "production") {
    // 프로덕션에서만 실제 SMTP 사용
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // 테스트/개발 환경에서는 네트워크 호출 없는 streamTransport
    transporter = nodemailer.createTransport({
      streamTransport: true, // 메일을 네트워크 대신 스트림으로만 처리
      newline: "unix",
      buffer: true,
    });
  }

  return transporter;
};

// 테스트/프로덕션 공용 sendMail 함수
const sendMailSafe = async (options: {
  from: string;
  to?: string;
  subject: string;
  text: string;
}) => {
  if (process.env.NODE_ENV === "production") {
    const transport = await getTransporter();
    return transport.sendMail(options);
  } else {
    const transport = await getTransporter();
    const info = await transport.sendMail(options);

    // 콘솔 출력 + 파일 저장 (외부 발송 없음)
    console.log("=== 테스트용 메일 (외부 전송 없음) ===");
    console.log("From:", options.from);
    console.log("To:", options.to ?? "(지정 안 됨)");
    console.log("Subject:", options.subject);
    console.log("Text:", options.text);

    fs.mkdirSync("./mails", { recursive: true });
    fs.writeFileSync(`./mails/${Date.now()}.eml`, info.message);

    return { messageId: "test-msg-id" };
  }
};

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
          from:
            process.env.NODE_ENV === "production"
              ? `"Moonshot" <${process.env.SMTP_USER}>`
              : '"Moonshot (테스트)" <no-reply@example.com>',
          ...(process.env.NODE_ENV === "production" && {
            to: member.user.email,
          }),
          subject: `프로젝트 "${project.name}" 삭제 안내`,
          text: `참여 중인 프로젝트 "${project.name}"가 삭제되었습니다.`,
        })
      )
  );

  return repo.deleteProjectRepo(projectId);
};
