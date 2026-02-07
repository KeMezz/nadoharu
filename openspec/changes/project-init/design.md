## Context

나도하루는 신규 프로젝트로, 아직 코드가 없는 상태이다. pnpm workspace 기반 모노레포를 구성하고, 백엔드(NestJS)와 프론트엔드(Next.js)가 빌드 및 실행 가능한 빈 프로젝트를 만든다.

NestJS 백엔드는 `/nestjs-ddd` 스킬에 정의된 DDD/Clean Architecture 구조를 따른다.

## Goals / Non-Goals

**Goals:**
- pnpm workspace로 `apps/api`, `apps/web`, `packages/shared` 모노레포 구성
- `apps/api`: NestJS 프로젝트를 `/nestjs-ddd` 스킬의 디렉토리 구조로 스캐폴딩
- `apps/web`: Next.js App Router 프로젝트 스캐폴딩
- `packages/shared`: 공유 패키지 구조 생성 (빈 상태)
- 루트 레벨 TypeScript, ESLint, Prettier 공유 설정
- docker-compose로 로컬 PostgreSQL 실행 환경
- Git 초기화 (.gitignore 포함)

**Non-Goals:**
- Prisma 스키마 정의 및 마이그레이션 (다음 change에서)
- GraphQL 모듈 설정 (다음 change에서)
- 인증(Passport/JWT) 설정 (다음 change에서)
- CI/CD 파이프라인 구성
- 프로덕션 Docker 이미지 빌드 설정
- Mock Factory(`fishery`) 설정 (테스트 인프라 구축 change에서)

## Decisions

### 1. 모노레포 구조

```
nadoharu/
├── pnpm-workspace.yaml
├── package.json                # 루트 (scripts, devDependencies)
├── tsconfig.base.json          # 공유 TS 설정
├── eslint.config.mjs           # 공유 ESLint (flat config)
├── .prettierrc                 # 공유 Prettier
├── .gitignore
├── docker-compose.yml
├── apps/
│   ├── api/                    # NestJS (DDD 구조)
│   │   ├── package.json
│   │   ├── tsconfig.json       # extends 루트
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── bounded-contexts/   # DDD bounded contexts
│   │       ├── shared-kernel/      # 공유 도메인 커널
│   │       │   ├── domain/
│   │       │   │   ├── value-objects/
│   │       │   │   ├── constants/
│   │       │   │   └── errors/
│   │       │   ├── application/
│   │       │   │   ├── transaction/
│   │       │   │   └── errors/
│   │       │   └── infrastructure/
│   │       │       └── gateways/prisma/
│   │       ├── common/             # 횡단 관심사
│   │       │   ├── middleware/
│   │       │   ├── guard/
│   │       │   ├── filter/
│   │       │   ├── logger/
│   │       │   └── graphql/
│   │       └── auth/               # 인증/인가 (빈 구조)
│   │           ├── guards/
│   │           ├── decorators/
│   │           └── policies/
│   └── web/                    # Next.js
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       └── app/
│           ├── layout.tsx
│           └── page.tsx
├── packages/
│   └── shared/                 # 공유 패키지
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
└── openspec/                   # 스펙 문서 (기존)
```

**대안**: Turborepo나 Nx를 사용할 수 있었으나, 빌드 오케스트레이션이 아직 필요 없는 초기 단계에서 pnpm workspace만으로 충분하다. 필요 시 나중에 Turborepo를 추가할 수 있다.

### 2. NestJS DDD 디렉토리 구조

`/nestjs-ddd` 스킬의 구조를 그대로 적용한다:
- `bounded-contexts/`: 비즈니스 도메인별 모듈 (현재는 빈 디렉토리)
- `shared-kernel/`: 공유 도메인 객체 (errors, value-objects, transaction 인터페이스)
- `common/`: 기술적 횡단 관심사 (middleware, guard, filter, logger)
- `auth/`: 인증/인가 관련 (빈 구조만)

**주의**: 스캐폴딩 시 반드시 `/nestjs-ddd` 스킬을 호출하여 구조와 컨벤션을 준수할 것. 위 디렉토리 트리는 개요 수준의 참고용이며, `/nestjs-ddd` 스킬의 디렉토리 구조를 원본으로 한다.

### 3. TypeScript 설정 전략

루트 `tsconfig.base.json`에 공통 설정을 두고, 각 패키지에서 `extends`한다.

```
tsconfig.base.json (공통: strict, target, moduleResolution)
  ├── apps/api/tsconfig.json (NestJS: experimentalDecorators, emitDecoratorMetadata)
  ├── apps/web/tsconfig.json (Next.js: jsx, next 플러그인)
  └── packages/shared/tsconfig.json (라이브러리: declaration)
```

### 4. Docker Compose (로컬 개발)

PostgreSQL만 컨테이너로 실행. 앱 서버는 로컬에서 직접 실행한다.

```yaml
services:
  postgres:
    image: postgres:17-alpine
    ports: 5432:5432
    environment: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
    volumes: postgres-data (named volume)
```

### 5. ESLint 설정 형식

ESLint 9.x의 flat config(`eslint.config.mjs`)를 사용한다. legacy config(`.eslintrc.*`)는 사용하지 않는다.

최신 안정 버전 사용 원칙에 따라 flat config를 채택하며, NestJS와 Next.js 각각의 린트 규칙은 루트 flat config에서 파일 패턴별로 분기한다.

### 6. 패키지 간 의존성

```
apps/api  ──depends──▶  packages/shared
apps/web  ──depends──▶  packages/shared
```

pnpm workspace protocol (`workspace:*`)로 로컬 패키지 참조.

## Risks / Trade-offs

- **[빈 프로젝트 오버헤드]** → DDD 디렉토리 구조가 초기에는 빈 폴더가 많아 보일 수 있으나, 기능 추가 시 일관된 구조를 제공한다.
- **[ESLint/Prettier 설정 충돌]** → NestJS와 Next.js의 린트 규칙이 다를 수 있다. 루트에 공통 설정 + 각 앱에서 오버라이드하는 구조로 해결.
- **[pnpm workspace 한계]** → 빌드 캐시/병렬 빌드가 없다. 프로젝트가 커지면 Turborepo 추가를 검토.
