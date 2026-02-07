# 나도하루 (Nadoharu) - Initial Spec

## 프로젝트 개요

**나도하루**는 일상을 공유하고 공감하는 모바일 우선 소셜 플랫폼이다.
핵심 인터랙션은 "나도!" — 다른 사람의 하루에 공감을 표현하는 행위다.

이전 프론트엔드 전용 프로젝트(`nadoharu-front`)를 **모노레포 구조로 재구축**하며, 백엔드를 포함한 풀스택 프로젝트로 확장한다.

---

## 도메인 핵심 개념

| 개념 | 설명 |
|------|------|
| **Post** | 텍스트(150자) + 이미지(최대 4장) + 태그로 구성된 게시물 |
| **Nado (나도)** | 게시물에 공감 표현. 좋아요와 유사하지만 리포스트 성격도 가짐 |
| **NadoPost** | 나도한 게시물이 자신의 타임라인에 노출되는 리포스트 기능 |
| **Comment** | 게시물에 달리는 댓글 |
| **Friend** | 친구 신청 → 수락/거절 방식의 양방향 관계 |
| **Chat** | 1:1 실시간 메시징 |
| **Notification** | 친구 신청, 나도, 댓글 등 활동 알림 |

---

## 주요 기능

### 인증
- 자체 회원가입/로그인 (username + password)
- 소셜 로그인 (Apple, Kakao, GitHub)
- JWT 기반 세션 관리

### 게시물 (Posts)
- 타임라인 피드 (커서 기반 무한 스크롤)
- 게시물 작성/수정/삭제
- 이미지 업로드 (클라이언트 압축, S3 호환 스토리지 저장)
- Pull-to-Refresh

### 나도 (Nado)
- 게시물에 나도 추가/취소
- 나도한 게시물이 타임라인에 리포스트로 표시
- 나도한 사용자 목록 조회

### 댓글 (Comments)
- 게시물에 댓글 작성/삭제

### 친구 (Friends)
- 친구 신청 보내기
- 친구 요청 수락/거절
- 받은 친구 요청 목록 관리

### 채팅 (Chat)
- 1:1 실시간 메시지
- 채팅방 목록
- 새 대화 시작

### 프로필 (Profile)
- 사용자 프로필 조회/수정
- 프로필 이미지 업로드
- 자기소개 (about_me)
- 비밀번호 변경

### 알림 (Notifications)
- 친구 신청, 나도, 댓글 활동 알림

---

## 레거시 기술 스택 (참고용)

이전 프론트엔드에서 사용한 기술:

- **프레임워크**: Next.js 15 (App Router), React 19
- **언어**: TypeScript 5.8
- **API**: GraphQL (Apollo Client), codegen으로 타입 자동 생성
- **상태 관리**: Jotai (UI 상태), Apollo Cache (서버 상태)
- **UI**: Tailwind CSS 4, Radix UI, Framer Motion
- **폼**: React Hook Form
- **세션**: Iron Session (JWT 쿠키)
- **모바일**: PWA (next-pwa), Pull-to-Refresh, 가상화 리스트
- **이미지**: browser-image-compression → S3 업로드
- **배포**: Docker (Node 22 Alpine, standalone)
- **패키지 매니저**: Yarn 1.x

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **모노레포** | pnpm workspace |
| **패키지 매니저** | pnpm |
| **백엔드** | NestJS (DDD/Clean Architecture) |
| **API** | GraphQL (Code-first) |
| **ORM** | Prisma |
| **DB** | PostgreSQL |
| **실시간** | GraphQL Subscriptions (WebSocket) |
| **인증** | Passport + JWT |
| **프론트엔드** | Next.js (처음부터 재작성) |
| **백엔드 테스트** | Jest (Unit + Integration) |
| **프론트엔드 테스트** | Vitest (Unit) + Playwright (E2E) |
| **배포** | Docker |

> *모든 의존성은 작업 시점의 최신 안정(stable) 버전을 사용한다. 특정 버전 고정이 필요한 경우 해당 change의 design.md에 근거와 함께 기록한다.*

---

## 프로젝트 구조 (모노레포)

```
nadoharu/
├── apps/
│   ├── web/          # Next.js 프론트엔드 (재작성)
│   └── api/          # NestJS + GraphQL + Prisma + PostgreSQL
├── packages/
│   └── shared/       # 공유 타입, 유틸리티
├── openspec/         # 스펙 문서
└── ...
```

---

## 백엔드 요구사항 (신규)

### API
- GraphQL API 서버 (레거시 프론트엔드의 쿼리/뮤테이션 호환)
- 17개 기존 GraphQL 작업 지원

### 데이터 모델
- User: `id`, `name`, `email`, `account_id`, `about_me`, `profile_image_url`
- Post: `id`, `content`, `tags`, `category`, `imageUrls`, `author`, 나도 관련 필드
- Comment: `id`, `content`, `postId`, `commenter`, `createdAt`
- Friend: 양방향 관계, 신청/수락/거절 상태
- Chat: 채팅방, 메시지
- Notification: 활동 기반 알림

### 인프라
- 이미지 저장: S3 호환 오브젝트 스토리지 (로컬: MinIO, 프로덕션: Cloudflare R2, 확장 시 AWS S3)
- 실시간: GraphQL Subscriptions (WebSocket 기반, 채팅/알림)

---

## 제약 조건

- 게시물 내용: 최대 150자
- 게시물 이미지: 최대 4장, 1MB 이하
- 사용자 이름: 최대 15자
- 비밀번호: 10자 이상, 소문자+숫자+특수문자 포함
- 페이지네이션: 커서 기반
- 모바일 브레이크포인트: 768px

---

## 테스트 전략 (TDD)

모든 코드는 **반드시 TDD(Test-Driven Development)** 로 작성한다: RED → GREEN → REFACTOR.
테스트 없는 코드는 머지할 수 없다.

### 백엔드 (NestJS)

| 테스트 유형 | 도구 | 대상 | 파일명 |
|------------|------|------|--------|
| Unit Test | Jest | Domain (Entity/VO) — 순수 로직, Mock 불필요 | `*.spec.ts` |
| Unit Test | Jest | UseCase — 외부 의존 Mock | `*.spec.ts` |
| Integration Test | Jest + Supertest | Controller/Resolver — DB 결합 | `*.integration.spec.ts` |

- `/nestjs-ddd` 스킬의 테스트 패턴을 따름
- Mock Factory: `fishery` 라이브러리 사용
- 커버리지 목표: **80% 이상**

### 프론트엔드 (Next.js)

| 테스트 유형 | 도구 | 대상 |
|------------|------|------|
| Unit Test | Vitest | 컴포넌트, 훅, 유틸리티 |
| E2E Test | Playwright | 핵심 사용자 흐름 (인증, 게시물 CRUD, 나도, 채팅 등) |

- 모든 페이지/기능에 대해 E2E 테스트 필수
- 커버리지 목표: **80% 이상**

### 공통 원칙

- 기능 개발 시: 실패 테스트 먼저 작성 → 구현 → 리팩토링
- 버그 수정 시: 버그를 재현하는 테스트 먼저 작성 → 수정
- 리팩토링 시: 기존 테스트가 있는지 먼저 확인, 없으면 추가 후 진행

---

## 결정 사항

- [x] 백엔드 프레임워크: **NestJS** (DDD/Clean Architecture)
- [x] API: **GraphQL Code-first**
- [x] ORM: **Prisma**
- [x] 데이터베이스: **PostgreSQL** (레거시 MongoDB에서 전환)
- [x] 모노레포 도구: **pnpm workspace**
- [x] 프론트엔드 전략: **처음부터 재작성**
- [x] 실시간 통신: **GraphQL Subscriptions** (WebSocket)
- [x] 인증: **Passport + JWT**
- [x] 테스트 전략: **TDD 필수** (백엔드 Jest, 프론트 Vitest + Playwright E2E)
- [x] 이미지 스토리지: **S3 호환** (로컬 MinIO → Cloudflare R2 → AWS S3)
- [x] PR Preview 배포: **Vercel 또는 Netlify** (아래 CI 전략 참조)

---

## CI 전략

### PR Preview 배포 (프론트엔드)

PR이 올라올 때마다 `apps/web`을 자동 빌드하여 프리뷰 URL을 생성한다.

| 항목 | 내용 |
|------|------|
| **플랫폼** | Vercel 또는 Netlify (수동 연동 필요) |
| **트리거** | PR 생성/업데이트 시 자동 빌드 |
| **프리뷰 URL** | PR별 고유 URL 자동 생성 (예: `pr-42.nadoharu.vercel.app`) |
| **대상** | `apps/web` (Next.js) |
| **환경변수** | API endpoint는 스테이징/목 서버를 가리킴 |

**수동 설정 필요 사항:**
1. Vercel/Netlify에 GitHub 레포 연결
2. Root Directory를 `apps/web`으로 설정
3. Build Command: `pnpm --filter web build`
4. Install Command: `pnpm install`
5. 환경변수 설정 (API URL 등)

**참고:** 백엔드(API) Preview는 별도 인프라가 필요하므로 초기에는 프론트엔드만 Preview 배포한다. 백엔드는 로컬 또는 스테이징 서버를 공유한다.

## 미결정 사항

> 개발하면서 결정할 것들

- [ ] CI/CD 파이프라인 구성 (GitHub Actions: lint, test, build)
- [ ] Prisma + DDD 레이어 분리 수준 (순수 DDD vs 실용적 DDD)
- [ ] PR Preview 플랫폼 최종 선택 (Vercel vs Netlify)
