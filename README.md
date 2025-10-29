# nb04-moonshot-team6

## [🔗 노션](https://www.notion.so/Part3-Team6_-27e901367b6a81c49fafc5e352c4c204)

## 팀원 구성

김민수<br>
김현정<br>
송창준<br>
엄규리<br>
이봉준<br>
이재훈

## 프로젝트 소개

프로젝트 일정 관리 서비스 백엔드 시스템 구축<br>
프로젝트 기간: 2025.09.30 ~ 2025.10.29

## 기술 스택

Backend: Node.js (Express, TypeScript)<br>
Database: PostgreSQL<br>
공통 Tool: Git & Github, Discord

## 팀원별 구현 기능 상세

김민수
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

김현정
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

송창준
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

엄규리
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

이봉준
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

이재훈
(자신이 개발한 기능에 대한 사진이나 gif 파일 첨부)

## 구현 홈페이지

주소: https://nb04-moonshot-team6-front.onrender.com

## 프로젝트 회고록

(제작한 발표자료 링크 혹은 첨부파일 첨부)

## 파일 구조

```
nb04-moonshot-team6
├─ README.md
├─ package-lock.json
├─ package.json
├─ prisma
│  ├─ schema.prisma
│  └─ seed.ts
├─ src
│  ├─ app.ts
│  ├─ configs
│  │  ├─ cloudinary.ts
│  │  ├─ passport.ts
│  │  └─ prisma.ts
│  ├─ controllers
│  │  ├─ auth.controller.ts
│  │  ├─ comment.controller.ts
│  │  ├─ dashboard.controller.ts
│  │  ├─ member.controller.ts
│  │  ├─ project.controller.ts
│  │  ├─ subtask.controller.ts
│  │  ├─ task.controller.ts
│  │  └─ user.controller.ts
│  ├─ middlewares
│  │  ├─ auth.middleware.ts
│  │  ├─ error.middleware.ts
│  │  └─ upload.middleware.ts
│  ├─ repositories
│  │  ├─ auth.repository.ts
│  │  ├─ comment.repository.ts
│  │  ├─ member.repository.ts
│  │  ├─ project.repository.ts
│  │  ├─ subtask.repository.ts
│  │  ├─ task.repository.ts
│  │  └─ user.repository.ts
│  ├─ routes
│  │  ├─ auth.route.ts
│  │  ├─ comment.route.ts
│  │  ├─ dashboard.route.ts
│  │  ├─ index.ts
│  │  ├─ member.route.ts
│  │  ├─ project.route.ts
│  │  ├─ subtask.router.ts
│  │  ├─ task.router.ts
│  │  ├─ upload.route.ts
│  │  └─ user.route.ts
│  ├─ services
│  │  ├─ auth.service.ts
│  │  ├─ comment.service.ts
│  │  ├─ dashboard.service.ts
│  │  ├─ googleCalendar.service.ts
│  │  ├─ member.service.ts
│  │  ├─ project.service.ts
│  │  ├─ subtask.service.ts
│  │  ├─ task.service.ts
│  │  ├─ upload.service.ts
│  │  └─ user.service.ts
│  ├─ types
│  │  ├─ express.d.ts
│  │  └─ task.ts
│  └─ utils
│     ├─ constants.ts
│     ├─ error.ts
│     ├─ HttpError.ts
│     ├─ jwt.ts
│     ├─ logger.ts
│     ├─ statusMapper.ts
│     └─ task.utils.ts
├─ tsconfig.json
├─ tsconfig.tsbuildinfo
└─ tsconfig.seed.json

```
