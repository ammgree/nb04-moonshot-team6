import {
  PrismaClient,
  MemberRole,
  InvitationStatus,
  TaskStatus,
  SubtaskStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. 테스트용 사용자 생성 (실제 이메일 아님, 비밀번호는 무작위)
  const user1 = await prisma.user.create({
    data: {
      email: "test-owner@example.com",
      name: "테스트 오너",
      password: "testpass1",
      googleId: "test-google-1",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "test-member@example.com",
      name: "테스트 멤버",
      password: "testpass2",
      googleId: "test-google-2",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "test-guest@example.com",
      name: "테스트 게스트",
      password: "testpass3",
    },
  });

  // 2. 프로젝트 생성 및 멤버 연결
  const project1 = await prisma.project.create({
    data: {
      name: "알파 프로젝트",
      description: "테스트용 알파 프로젝트",
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: MemberRole.OWNER },
          { userId: user2.id, role: MemberRole.MEMBER },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "베타 프로젝트",
      description: "테스트용 베타 프로젝트",
      ownerId: user2.id,
      members: {
        create: [
          { userId: user2.id, role: MemberRole.OWNER },
          { userId: user3.id, role: MemberRole.MEMBER },
        ],
      },
    },
  });

  // 3. 초대 생성 (테스트용 이메일)
  await prisma.invitation.create({
    data: {
      projectId: project1.id,
      email: "invitee-test@example.com",
      invitationId: "test-uuid-1234",
      status: InvitationStatus.PENDING,
      invitedBy: user1.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1일 후 만료
    },
  });

  // 4. 태스크 생성
  const task1 = await prisma.task.create({
    data: {
      title: "저장소 준비",
      content: "GitHub 저장소 초기 세팅 진행",
      status: TaskStatus.TODO,
      startAt: new Date("2025-10-01T09:00:00Z"),
      endAt: new Date("2025-10-03T18:00:00Z"),
      projectId: project1.id,
      assigneeId: user2.id,
      tags: ["설정", "저장소"],
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "UI 화면 설계",
      content: "Figma에서 초기 화면 UI 설계 진행",
      status: TaskStatus.IN_PROGRESS,
      startAt: new Date("2025-10-02T09:00:00Z"),
      endAt: new Date("2025-10-07T18:00:00Z"),
      projectId: project1.id,
      assigneeId: user1.id,
      tags: ["디자인", "UI"],
    },
  });

  // 5. 서브태스크 생성
  await prisma.subtask.createMany({
    data: [
      { title: "저장소 생성", status: SubtaskStatus.TODO, taskId: task1.id },
      {
        title: "브랜치 규칙 설정",
        status: SubtaskStatus.TODO,
        taskId: task1.id,
      },
      {
        title: "로그인 화면 설계",
        status: SubtaskStatus.DONE,
        taskId: task2.id,
      },
      {
        title: "대시보드 화면 설계",
        status: SubtaskStatus.TODO,
        taskId: task2.id,
      },
    ],
  });

  // 6. 코멘트 생성
  await prisma.comment.createMany({
    data: [
      {
        content: "좋아요, 바로 시작합시다!",
        authorId: user1.id,
        taskId: task1.id,
      },
      {
        content: "UI 설계 방향 확인 완료",
        authorId: user2.id,
        taskId: task2.id,
      },
    ],
  });

  console.log("테스트용 Seed 데이터 삽입 완료 ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
