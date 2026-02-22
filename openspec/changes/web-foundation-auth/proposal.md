## Why

현재 인증 백엔드는 구현되어 있지만 `apps/web`는 초기 스켈레톤 수준이라, 이후 기능별 프론트엔드 구현을 진행할 공통 인증 기반이 부족하다. 또한 레거시 프론트(`nadoharu-front`)의 화면/UX를 재사용하려면 기존 API 계약(accountId, httpOnly 쿠키 기반 인증)과의 정렬이 먼저 필요하다.

## What Changes

- **인증 화면 기반 구축**: 레거시 로그인/회원가입 UI 톤을 유지하면서 `apps/web`에 인증 화면 흐름을 구축
- **인증 계약 정렬**: GraphQL 인증 연동을 현재 API 기준으로 정렬 (`createUser(input)`, `login(input)`, `me`)
- **세션 전략 표준화**: 프론트 인증 상태를 JWT 문자열 직접 저장 방식이 아니라 httpOnly `accessToken` 쿠키 기반으로 통일
- **라우트 접근 정책 정의**: 공개 전용 라우트(`/login`, `/sign-up`)와 보호 라우트(`/posts`, `/me` 등) 리다이렉트 규칙 명시 (`/me`를 auth 기본 진입점으로 사용)
- **인증 에러 UX 통일**: `INVALID_CREDENTIALS`, `ACCOUNT_TEMPORARILY_LOCKED`, `UNAUTHORIZED` 등 인증 에러 표시 규칙 정립
- **소셜 버튼 처리 방침**: Apple/Kakao/GitHub 버튼은 외관만 제공하고 비활성 상태로 노출
- **범위 제외**: Apple/Kakao/GitHub 소셜 로그인 인증 연동(실제 동작) 및 도메인 기능(post/comment/friend/chat/notification) 화면 구현은 별도 change에서 진행
- **별도 change 분리**: 루트 랜딩 페이지(로그인/회원가입 진입 동선 포함) 설계/구현은 별도 change에서 진행

## Capabilities

### New Capabilities

- `web-auth-forms`: 로그인/회원가입 폼 UI, 제출/로딩/실패 상태, 성공 후 라우팅 UX를 정의한다
- `web-auth-cookie-session`: httpOnly `accessToken` 쿠키를 전제로 한 세션 인식 및 인증 사용자 컨텍스트 처리 규칙을 정의한다
- `web-auth-route-guard`: 공개/보호 라우트 접근 제어와 비인증/인증 사용자 리다이렉트 동작을 정의한다
- `web-auth-error-feedback`: 인증 관련 GraphQL 에러 코드를 사용자 메시지로 매핑하는 규칙을 정의한다

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**프론트엔드 (`apps/web`)**:

- 인증 페이지, 라우트 가드, 인증 세션 처리, 인증 에러 표시 컴포넌트/유틸리티 추가
- 관련 단위 테스트(Vitest) 및 E2E(Playwright) 시나리오 추가

**백엔드 (`apps/api`)**:

- 기능 자체 변경은 없고, 프론트 소비 관점의 쿠키/CORS/인증 흐름 검증이 필요할 수 있음

**레거시 참조 (`/home/hyeongjin/codes/nadoharu-front`)**:

- 디자인/UX 참고 소스로 활용하며, 데이터 계약은 현행 API 스펙 기준으로 재정의
