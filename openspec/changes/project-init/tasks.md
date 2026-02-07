## 1. 프로젝트 루트 초기화

- [x] 1.1 Git 초기화 및 `.gitignore` 작성 (node_modules, dist, .env, .env.* 등)
- [x] 1.2 루트 `package.json` 생성 (프로젝트 메타데이터, 루트 스크립트: dev, build, lint, test, test:e2e)
- [x] 1.3 `pnpm-workspace.yaml` 생성 (`apps/*`, `packages/*` 등록)
- [x] 1.4 루트 `tsconfig.base.json` 생성 (strict: true, 공통 컴파일러 옵션)
- [x] 1.5 루트 `.prettierrc` 생성
- [x] 1.6 루트 ESLint flat config 설정 생성 (`eslint.config.mjs`)

## 2. packages/shared 공유 패키지

- [x] 2.1 `packages/shared/package.json` 생성 (패키지명: `@nadoharu/shared`)
- [x] 2.2 `packages/shared/tsconfig.json` 생성 (루트 extends, declaration 출력)
- [x] 2.3 `packages/shared/src/index.ts` 빈 엔트리 파일 생성

## 3. apps/api NestJS 프로젝트 (`/nestjs-ddd` 스킬 사용)

- [x] 3.1 `apps/api/package.json` 생성 (NestJS 의존성, `@nadoharu/shared` workspace 참조)
- [x] 3.2 `apps/api/tsconfig.json` 생성 (루트 extends, experimentalDecorators, emitDecoratorMetadata)
- [x] 3.3 `apps/api/nest-cli.json` 생성
- [x] 3.4 `apps/api/src/main.ts` 생성 (NestJS 부트스트랩)
- [x] 3.5 `apps/api/src/app.module.ts` 생성 (루트 모듈)
- [x] 3.6 `/nestjs-ddd` 스킬 기반 DDD 디렉토리 구조 생성: `bounded-contexts/`, `shared-kernel/` (domain/value-objects, domain/constants, domain/errors, application/transaction, application/errors, infrastructure/gateways/prisma), `common/` (middleware, guard, filter, logger, graphql), `auth/` (guards, decorators, policies)
- [x] 3.7 Jest 테스트 환경 설정 (`jest.config.ts`, `tsconfig.spec.json`)
- [x] 3.8 샘플 테스트 파일 작성 및 `pnpm test` 실행 확인
- [x] 3.9 NestJS 개발 서버 실행 확인 (`pnpm dev`)

## 4. apps/web Next.js 프로젝트

- [x] 4.1 `apps/web/package.json` 생성 (Next.js 의존성, `@nadoharu/shared` workspace 참조)
- [x] 4.2 `apps/web/tsconfig.json` 생성 (루트 extends, jsx, Next.js 플러그인, module/moduleResolution을 bundler로 오버라이드)
- [x] 4.3 `apps/web/next.config.ts` 생성
- [x] 4.4 `apps/web/app/layout.tsx` 및 `apps/web/app/page.tsx` 생성
- [x] 4.5 Vitest 테스트 환경 설정 (`vitest.config.ts`)
- [x] 4.6 Playwright E2E 테스트 환경 설정 (`playwright.config.ts`)
- [x] 4.7 샘플 테스트 파일 작성 및 `pnpm test`, `pnpm test:e2e` 실행 확인
- [x] 4.8 Next.js 개발 서버 실행 확인 (`pnpm dev`)

## 5. Docker 및 개발 환경

- [ ] 5.1 `docker-compose.yml` 생성 (PostgreSQL 17 Alpine, 포트 5432, named volume)
- [ ] 5.2 `.env.example` 생성 (DB 접속 정보 등 환경 변수 템플릿)
- [ ] 5.3 `docker compose up -d` 로 PostgreSQL 컨테이너 정상 실행 확인

## 6. 전체 검증

- [ ] 6.1 루트에서 `pnpm install` 정상 완료 확인
- [ ] 6.2 루트에서 `pnpm build` 전체 빌드 정상 확인
- [ ] 6.3 루트에서 `pnpm lint` 전체 린트 정상 확인
- [ ] 6.4 루트에서 `pnpm test` 전체 테스트 정상 확인
- [ ] 6.5 루트에서 `pnpm dev` 로 api + web 동시 실행 확인
