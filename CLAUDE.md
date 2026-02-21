# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always respond in Korean.

## 프로젝트 개요

나도하루(Nadoharu) — 일상을 공유하고 공감("나도!")하는 모바일 우선 소셜 플랫폼. pnpm workspace 모노레포.

## 기술 스택

- **apps/api**: NestJS 11, GraphQL Code-first, Prisma, PostgreSQL 17, Jest
- **apps/web**: Next.js 16 (App Router), React 19, Vitest, Playwright
- **packages/shared**: 공유 타입/유틸리티
- **인프라**: Docker Compose (PostgreSQL 17 Alpine), Cloudflare R2 (S3 호환)
- **개발 도구**: pnpm workspace, TypeScript 5.7 (strict mode), ESLint 9, Prettier

## 명령어

```bash
# 루트에서 실행
pnpm install          # 전체 의존성 설치
pnpm dev              # api(3001) + web(3000) 동시 개발 서버
pnpm build            # 전체 빌드
pnpm lint             # 전체 린트
pnpm test             # 전체 테스트 (unit + integration)
pnpm test:e2e         # Playwright E2E 테스트

# 개별 앱
pnpm --filter api dev           # 백엔드만 실행 (http://localhost:3001)
pnpm --filter web dev           # 프론트엔드만 실행 (http://localhost:3000)
pnpm --filter api test          # 백엔드 테스트만
pnpm --filter api test:watch    # 백엔드 테스트 watch 모드
pnpm --filter api test:cov      # 백엔드 테스트 커버리지
pnpm --filter web test          # 프론트엔드 테스트만
pnpm --filter web test:watch    # 프론트엔드 테스트 watch 모드

# 인프라
docker compose up -d            # PostgreSQL 시작 (localhost:5432)
docker compose down             # PostgreSQL 중지
docker compose ps               # 컨테이너 상태 확인
```

## 필수 규칙

### 백엔드는 반드시 `/nestjs-ddd` 스킬 사용

`apps/api` 코드를 작성하거나 수정할 때는 **반드시 `/nestjs-ddd` 스킬을 호출**하여 DDD/Clean Architecture 지침을 따른다.

- 의존 방향: Domain ← Application ← Infrastructure (절대 규칙)
- 개발 순서: Domain(Entity/VO) → Application(UseCase) → Infrastructure(Repository/Controller)
- bounded-context 간 통신: UseCase를 DI하여 호출, Repository/Entity 직접 import 금지

### TDD 철저

모든 코드는 **TDD로 작성**한다. 예외 없음.

1. **RED** — 실패하는 테스트 먼저 작성
2. **GREEN** — 테스트를 통과하는 최소 코드 작성
3. **REFACTOR** — 테스트가 통과한 상태에서 개선

- 백엔드: `*.spec.ts` (unit), `*.integration.spec.ts` (integration)
- 프론트엔드: Vitest (unit), Playwright (E2E)
- 커버리지 목표: 80% 이상
- 테스트 없는 코드는 머지 불가

### PR과 Change는 작게 유지

- PR 단위는 **~500행 이하**를 목표로 한다
- OpenSpec change 자체를 작은 단위로 쪼개서 작업
- 하나의 change = 하나의 명확한 목적
- 큰 기능은 여러 change로 분리 (예: 인증 → 회원가입 / 로그인 / 소셜 로그인)

### 커밋 컨벤션

Conventional Commits 형식, 한국어 description:

```
<type>(<scope>): <description>

feat(api): 사용자 인증 모듈 추가
fix(web): 로그인 리다이렉트 무한 루프 수정
chore: 프로젝트 초기 설정
```

### CLAUDE.md 갱신

작업 완료 후 이 문서에 영향을 주는 변경이 있으면 **반드시 CLAUDE.md를 업데이트**한다:

- 새 명령어, 스크립트가 추가된 경우
- 아키텍처 구조가 변경된 경우
- 새 필수 규칙이나 컨벤션이 도입된 경우
- 새 스킬이 추가된 경우

### 스킬 활용

- `/nestjs-ddd` — 백엔드 코드 작성 시 필수
- `/branch-and-commit` — 브랜치 생성 + Conventional Commit
- `/create-pr` — PR 템플릿 기반 PR 생성

### OpenCode 커맨드

- OpenSpec 공식 OpenCode 커맨드는 `.opencode/command/opsx-*.md` 기준으로 사용
- 커스텀 커맨드는 `.opencode/command/`에 유지 (`/branch-and-commit`, `/create-pr`)
- OpenCode에서는 커스텀 워크플로우를 skill보다 command 우선으로 관리

## 아키텍처

### 백엔드 (apps/api) — DDD/Clean Architecture

```
src/
├── bounded-contexts/<context>/
│   ├── domain/          # Entity, VO, Domain Service (외부 의존 없음)
│   ├── application/     # UseCase, Repository 인터페이스 (Domain만 의존)
│   └── infrastructure/  # Prisma Repository, Controller, Resolver, Module
├── shared-kernel/       # 공유 도메인 커널 (domain/application/infrastructure)
├── common/              # 횡단 관심사 (middleware, guard, filter, logger)
└── auth/                # 인증/인가 (guards, decorators, policies)
```

### 개발 워크플로우 (OpenSpec)

```
/opsx:explore  →  아이디어 탐색
/opsx:new      →  change 생성 (proposal → design → specs → tasks)
/opsx:ff       →  change + 전체 artifact 한번에 생성
/opsx:apply    →  tasks 기반 구현
/opsx:verify   →  구현 검증
/opsx:archive  →  완료 후 아카이브
```

## 환경 설정

### 로컬 개발 환경 설정

1. **환경 변수 설정**

   ```bash
   cp .env.example .env
   # .env 파일을 열어 필요한 값 수정
   ```

2. **데이터베이스 시작**

   ```bash
   docker compose up -d
   ```

3. **의존성 설치 및 실행**
   ```bash
   pnpm install
   pnpm dev
   ```

### 포트 구성

- **Web (Next.js)**: http://localhost:3000
- **API (NestJS)**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### 데이터베이스 연결

기본 연결 정보 (`.env.example` 참고):

```
DATABASE_URL="postgresql://nadoharu:nadoharu_dev@localhost:5432/nadoharu"
```
