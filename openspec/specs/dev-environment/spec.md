# Dev Environment Specification

## Purpose

로컬 개발 환경에서 공통 도구와 인프라를 일관되게 설정하고 실행하기 위한 기준을 정의한다.

## Requirements

### Requirement: 공유 TypeScript 설정

루트에 `tsconfig.base.json`을 두고, 각 패키지가 이를 extends하여 공통 설정을 공유해야(SHALL) 한다.

#### Scenario: 루트 tsconfig.base.json 존재

- **WHEN** 프로젝트 루트를 확인하면
- **THEN** `tsconfig.base.json`이 존재하고 `strict: true`가 설정되어 있다

#### Scenario: 각 패키지에서 extends

- **WHEN** `apps/api/tsconfig.json`, `apps/web/tsconfig.json`, `packages/shared/tsconfig.json`을 확인하면
- **THEN** 모두 루트 `tsconfig.base.json`을 extends하고 있다

### Requirement: ESLint 설정

루트에 공유 ESLint 설정을 두고, 각 앱에서 필요에 따라 오버라이드해야(SHALL) 한다.

#### Scenario: ESLint 실행

- **WHEN** 프로젝트 루트에서 ESLint를 실행하면
- **THEN** `apps/api`와 `apps/web`의 코드가 모두 검사된다

### Requirement: Prettier 설정

루트에 `.prettierrc` 설정 파일이 존재하여 일관된 코드 포매팅을 제공해야(SHALL) 한다.

#### Scenario: Prettier 설정 파일 존재

- **WHEN** 프로젝트 루트를 확인하면
- **THEN** `.prettierrc` 파일이 존재한다

### Requirement: Docker Compose로 로컬 PostgreSQL 실행

`docker-compose.yml`로 로컬 개발용 PostgreSQL 컨테이너를 실행할 수 있어야(SHALL) 한다.

#### Scenario: PostgreSQL 컨테이너 시작

- **WHEN** 프로젝트 루트에서 `docker compose up -d`를 실행하면
- **THEN** PostgreSQL 17 컨테이너가 포트 5432에서 실행된다

#### Scenario: 데이터 영속성

- **WHEN** PostgreSQL 컨테이너를 중지 후 다시 시작하면
- **THEN** named volume으로 데이터가 보존된다

### Requirement: Git 설정

프로젝트가 Git으로 초기화되고, 적절한 `.gitignore`가 설정되어야(SHALL) 한다.

#### Scenario: .gitignore 설정

- **WHEN** `.gitignore`를 확인하면
- **THEN** `node_modules/`, `dist/`, `.env`, `.env.*`, `!.env.example` 등 일반적인 항목이 포함되어 있다

### Requirement: 루트 package.json 스크립트

루트 `package.json`에 전체 프로젝트를 관리하는 편의 스크립트가 있어야(SHALL) 한다.

#### Scenario: 개발 서버 동시 실행

- **WHEN** 루트에서 `pnpm dev`를 실행하면
- **THEN** api와 web 개발 서버가 동시에 시작된다

#### Scenario: 전체 빌드

- **WHEN** 루트에서 `pnpm build`를 실행하면
- **THEN** 모든 패키지가 빌드된다

#### Scenario: 전체 린트

- **WHEN** 루트에서 `pnpm lint`를 실행하면
- **THEN** 모든 패키지의 린트가 실행된다
