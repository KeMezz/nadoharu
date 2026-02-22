## Why

나도하루 플랫폼의 사용자 인증 시스템이 필요하다. 회원가입, 로그인, 세션 관리 기능을 구현하여 사용자가 안전하게 플랫폼을 이용할 수 있도록 한다.

레거시 프론트엔드가 이미 존재하고 GraphQL API 스펙이 정의되어 있으므로, 백엔드를 먼저 구축하여 기존 프론트엔드와 호환되도록 한다.

## What Changes

- **회원가입 기능**: GraphQL Mutation으로 새 사용자 등록 (`createUser`)
- **로그인 기능**: GraphQL Mutation으로 인증 후 JWT 토큰 발급 (`login`)
- **JWT 토큰 관리**: 액세스 토큰 발급, 검증
- **세션 쿠키**: httpOnly cookie로 JWT 관리 (XSS 방지)
- **비밀번호 보안**: bcrypt 해싱, 정책 검증 (10자 이상, 소문자+숫자+특수문자)
- **인증 가드**: GraphQL Resolver에서 인증 필요 작업 보호
- **Prisma 스키마**: User 모델 정의

**범위 제외**:

- 소셜 로그인 (Apple, Kakao, GitHub) → 별도 change로 진행
- 비밀번호 재설정/찾기 → 추후 구현
- 이메일 인증 → 추후 구현

## Capabilities

### New Capabilities

- `user-registration`: 회원가입 API — 사용자 계정 생성 (account_id, password, email, name)
- `user-authentication`: 로그인 API — 자격 증명 검증 후 JWT 토큰 발급
- `jwt-token-management`: JWT 토큰 발급, 검증 로직
- `password-security`: 비밀번호 해싱 및 정책 검증 (bcrypt, 복잡도 규칙)
- `auth-guards`: GraphQL Resolver 보호를 위한 인증 가드/데코레이터

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**백엔드 (apps/api)**:

- 새 bounded-context: `user` 또는 `auth` (DDD 구조에 따라 결정)
- Prisma schema: User 모델 추가
- 의존성: `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`, `bcrypt`
- GraphQL schema: Mutation `createUser`, `login`
- 환경 변수: `JWT_SECRET`, `JWT_EXPIRES_IN`

**프론트엔드 (apps/web)**:

- 현재 변경 없음 (이미 레거시 프론트엔드 존재)
- 추후 Next.js 재작성 시 참고

**데이터베이스**:

- PostgreSQL User 테이블 생성 (Prisma migration)

**테스트**:

- Unit: Entity, VO, UseCase (비밀번호 정책, JWT 발급 로직)
- Integration: Resolver, Repository (회원가입/로그인 E2E)
