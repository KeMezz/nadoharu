## Purpose

pnpm workspace 기반 모노레포 구조와 각 애플리케이션/공유 패키지의 필수 구성 기준을 정의한다.

## Requirements

### Requirement: pnpm workspace 모노레포 구성

프로젝트 루트에 pnpm workspace를 설정하여 `apps/*`와 `packages/*`를 워크스페이스 패키지로 관리해야(SHALL) 한다.

#### Scenario: pnpm workspace 설정 파일 존재

- **WHEN** 프로젝트 루트를 확인하면
- **THEN** `pnpm-workspace.yaml`이 존재하고, `apps/*`와 `packages/*`가 워크스페이스로 등록되어 있다

#### Scenario: 루트에서 전체 의존성 설치

- **WHEN** 프로젝트 루트에서 `pnpm install`을 실행하면
- **THEN** 모든 워크스페이스 패키지의 의존성이 설치된다

### Requirement: apps/api NestJS 프로젝트 존재

`apps/api`에 NestJS 프로젝트가 존재하며, `/nestjs-ddd` 스킬의 DDD/Clean Architecture 디렉토리 구조를 따라야(SHALL) 한다.

#### Scenario: NestJS 앱 실행

- **WHEN** `apps/api`에서 `pnpm dev`를 실행하면
- **THEN** NestJS 개발 서버가 정상적으로 시작된다

#### Scenario: DDD 디렉토리 구조

- **WHEN** `apps/api/src` 디렉토리를 확인하면
- **THEN** `bounded-contexts/`, `shared-kernel/`, `common/`, `auth/` 디렉토리가 존재한다

#### Scenario: shared-kernel 하위 구조

- **WHEN** `apps/api/src/shared-kernel` 디렉토리를 확인하면
- **THEN** `domain/` (value-objects, constants, errors), `application/` (transaction, errors), `infrastructure/` (gateways/prisma) 구조가 존재한다

### Requirement: apps/web Next.js 프로젝트 존재

`apps/web`에 Next.js App Router 프로젝트가 존재해야(SHALL) 한다.

#### Scenario: Next.js 앱 실행

- **WHEN** `apps/web`에서 `pnpm dev`를 실행하면
- **THEN** Next.js 개발 서버가 정상적으로 시작된다

#### Scenario: App Router 구조

- **WHEN** `apps/web/app` 디렉토리를 확인하면
- **THEN** `layout.tsx`와 `page.tsx`가 존재한다

### Requirement: packages/shared 공유 패키지 존재

`packages/shared`에 공유 패키지가 존재하고, 다른 앱에서 참조 가능해야(SHALL) 한다.

#### Scenario: 워크스페이스 프로토콜로 참조

- **WHEN** `apps/api/package.json` 또는 `apps/web/package.json`을 확인하면
- **THEN** `@nadoharu/shared`가 `workspace:*` 프로토콜로 의존성에 등록되어 있다

#### Scenario: 공유 패키지 빌드

- **WHEN** `packages/shared`에서 빌드를 실행하면
- **THEN** 에러 없이 빌드가 완료된다
