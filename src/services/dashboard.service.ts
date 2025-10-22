import prisma from '../configs/prisma.js';
import express from 'express';
import createError  from 'http-errors';
import { Prisma } from "@prisma/client";
import { email } from 'zod';

const app = express();
app.use(express.json());

// 대쉬보드 조회 서비스
const getDashboardData = async (
  userId: number,
  from?: string,
  to?: string,
  project_id?: string,
  status?: string,
  assignee_id?: number,
  keyword?: string,
  ) => {

  // Task 필터링 조건 설정
  const where: any = {
    OR: [
      { project: { ownerId: userId } },
      { project: { members: { some: { userId } } } },
    ],
  };
  if (from && to) {
  const dateFilter = {
    startDate: { gte: new Date(from) },
    endDate:   { lte: new Date(to) },
  };
  // AND 배열이 이미 있을 수도 있으니까 병합
  where.AND = [...(where.AND || []), dateFilter];
}
// 프로젝트 ID 필터
if (project_id) {
  where.AND = [...(where.AND || []), { projectId: Number(project_id) }];
}
// 상태 필터
if (status) {
  where.AND = [...(where.AND || []), { status: status.toUpperCase() }];
}
// 담당자 필터
if (assignee_id) {
  where.AND = [...(where.AND || []), { assignee: { id: Number(assignee_id) } }];
}
// 키워드 필터
if (keyword) {
  where.AND = [...(where.AND || []), {
    title: { contains: keyword, mode: 'insensitive' },
  }];
}
  const tasks = await prisma.task.findMany({
    where,
    select: {
      id: true,
      projectId: true,
      title: true,
      startAt: true,
      endAt: true,
      status: true,
      assignee: {
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    },
      tags:  true ,
      files: {
        select: { id: true, url: true },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { startAt: 'asc' },
  });

// 날짜 분리
  const result = tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      startYear: t.startAt ? t.startAt.getFullYear() : null,
      startMonth: t.startAt ? t.startAt.getMonth() + 1 : null,
      startDay: t.startAt ? t.startAt.getDate() : null,
      endYear: t.endAt ? t.endAt.getFullYear() : null,
      endMonth: t.endAt ? t.endAt.getMonth() + 1 : null,
      endDay: t.endAt ? t.endAt.getDate() - 1 : null,
      status: t.status.toLowerCase(),
      assignee: t.assignee ? {
        id: t.assignee.id,
        name: t.assignee.name,
        email: t.assignee.email,
        profileImage: t.assignee.profileImage
      } : null,
      tags: t.tags.map((tag, i) => ({ id: i, name: tag })),
      attachments: t.files.map((file, i) => ({ id: i, url: file.url })),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
  }));
  console.log(result);
  return result;
};


// // 대쉬보드 담당자 조회
// const getAssigneeData = async (
//   userId: number,
//   assignee_id?: number,
//   ) => {

// const assigneeId: number = assignee_id ? assignee_id : userId;

// // 담당자 정보 조회
// const allMembers = await prisma.projectMember.findMany({
//   where: { project: { members: { some: { userId: assigneeId } } } },
//   include: { user: { select: { id: true, name: true } } },
// });

// console.log('Assignee ID:', assigneeId);
// console.log('All Members Before Deduplication:', allMembers);

// //console.log(allMembers);

// // // 중복 제거를 위한 Set 사용
// // const memberSet = new Set<{ id: number; name: string }>();
// // allMembers.forEach((member) => {
// //   memberSet.add({ id: member.user.id, name: member.user.name! });
// // });

// const ids = new Set<number>();
// const memberSet: { id: number; name: string }[] = [];
// allMembers.forEach((member) => {
//   if (!ids.has(member.user.id)) {
//     ids.add(member.user.id);
//     memberSet.push({ id: member.user.id, name: member.user.name! });
//   }
// });

// //console.log(memberSet);




//   console.log('All Members:', allMembers);
//   return allMembers;

// };



export default {
  getDashboardData,
};