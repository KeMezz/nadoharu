## Why

나도하루 프로젝트를 모노레포로 새로 시작하기 위해, 빌드 가능한 빈 프로젝트 구조가 필요하다. 이후 모든 기능 개발의 토대가 되는 초기 세팅이므로 가장 먼저 수행한다.

## What Changes

- pnpm workspace 모노레포 구조 생성 (`apps/api`, `apps/web`, `packages/shared`)
- `apps/api`: NestJS 프로젝트 스캐폴딩 (`/nestjs-ddd` 스킬을 사용하여 DDD/Clean Architecture 구조 적용)
- `apps/web`: Next.js 프로젝트 스캐폴딩
- `packages/shared`: 공유 패키지 구조 생성
- 루트 레벨 TypeScript, ESLint, Prettier 설정
- Docker 및 docker-compose 기본 설정 (PostgreSQL 컨테이너 포함)
- Git 초기화 및 .gitignore 설정

## Capabilities

### New Capabilities
- `monorepo-structure`: pnpm workspace 기반 모노레포 구조 및 패키지 간 의존성 설정
- `dev-environment`: 개발 환경 설정 (TypeScript, ESLint, Prettier, Docker, docker-compose)

### Modified Capabilities
(없음 — 신규 프로젝트)

## Impact

- 프로젝트 루트에 pnpm-workspace.yaml, package.json, tsconfig.json 등 설정 파일 생성
- apps/api, apps/web, packages/shared 디렉토리 구조 생성
- docker-compose.yml로 로컬 PostgreSQL 실행 환경 제공
- **주의**: NestJS 스캐폴딩 시 반드시 `/nestjs-ddd` 스킬을 사용하여 DDD/Clean Architecture 디렉토리 구조와 컨벤션을 적용할 것
