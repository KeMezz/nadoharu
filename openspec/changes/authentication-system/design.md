# Authentication System Design

## Context

나도하루 플랫폼의 사용자 인증 시스템을 구축한다. 현재 시스템에는 인증 메커니즘이 없으며, 사용자가 계정을 생성하고 로그인하여 보호된 리소스에 접근할 수 있도록 해야 한다.

**현재 상태:**
- NestJS 백엔드 (DDD/Clean Architecture)
- GraphQL Code-first API
- Prisma ORM + PostgreSQL 17
- 레거시 프론트엔드 존재 (GraphQL 스펙 정의됨)

**제약사항:**
- TDD 필수 (80%+ 커버리지)
- 기존 프론트엔드 GraphQL API와 호환 필요
- DDD 레이어드 아키텍처 준수 (Domain → Application → Infrastructure)

**이해관계자:**
- 백엔드 팀: 인증 시스템 구현
- 프론트엔드 팀: 기존 API 스펙 유지 필요
- 보안 팀: 비밀번호 정책, JWT 보안 검토

## Goals / Non-Goals

**Goals:**
- 회원가입/로그인 기능 구현 (GraphQL Mutation: `createUser`, `login`)
- JWT 기반 세션 관리 (httpOnly 쿠키)
- 비밀번호 보안 강화 (bcrypt 해싱, 복잡도 정책)
- 인증 가드를 통한 GraphQL Resolver 보호
- Rate limiting으로 무차별 대입 공격 방어
- TDD로 80%+ 테스트 커버리지 달성

**Non-Goals:**
- 소셜 로그인 (Apple, Kakao, GitHub) — 별도 change로 진행
- 비밀번호 재설정/찾기 — 추후 구현
- 이메일 인증 — 추후 구현
- Refresh token — 현재 단계에서는 access token만 구현

## Decisions

### 1. Bounded Context 구조: `auth` bounded-context 생성

**결정:** `apps/api/src/bounded-contexts/auth` 생성

**이유:**
- 사용자 인증/인가는 명확한 도메인 경계를 가짐
- User 엔티티와 인증 로직을 함께 관리
- 향후 권한 관리(authorization)로 확장 가능

**대안 고려:**
- `user` bounded-context: 사용자 프로필 관리와 혼재 가능
- `identity` bounded-context: 과도하게 추상적

**구조:**
```
apps/api/src/bounded-contexts/auth/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   ├── account-id.vo.ts
│   │   ├── password.vo.ts
│   │   └── email.vo.ts
│   └── services/
│       └── password.service.ts
├── application/
│   ├── use-cases/
│   │   ├── register-user.use-case.ts
│   │   └── authenticate-user.use-case.ts
│   └── ports/
│       └── user.repository.interface.ts
└── infrastructure/
    ├── persistence/
    │   └── prisma-user.repository.ts
    ├── graphql/
    │   ├── resolvers/
    │   │   └── auth.resolver.ts
    │   └── types/
    │       └── auth.types.ts
    └── guards/
        └── jwt-auth.guard.ts
```

### 2. JWT 토큰 전달: httpOnly 쿠키 전용

**결정:** JWT 토큰은 httpOnly 쿠키로만 전달, 응답 본문에 포함하지 않음

**이유:**
- XSS 공격으로부터 토큰 보호 (JavaScript 접근 불가)
- CSRF 공격은 sameSite 속성으로 방어
- 모바일 앱에서도 WebView 쿠키로 동작 가능

**대안 고려:**
- Authorization 헤더: 프론트엔드가 localStorage에 저장 시 XSS 취약
- 응답 본문 + 쿠키 병행: XSS 노출면 증가

**쿠키 설정:**
```typescript
{
  name: 'accessToken',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
  path: '/',
  maxAge: JWT_EXPIRES_IN (밀리초)
}
```

### 3. 비밀번호 해싱: bcrypt with salt rounds 10

**결정:** bcrypt 알고리즘 사용, salt rounds 10

**이유:**
- 산업 표준 비밀번호 해싱 알고리즘
- Rainbow table 공격 방어 (내장 salt)
- Adaptive hashing (계산 비용 조정 가능)

**대안 고려:**
- argon2: 더 강력하지만 Node.js 네이티브 지원 부족
- scrypt: bcrypt와 유사하나 생태계 지원 적음

**정책:**
- 최소 길이: 10자
- 최대 길이: 72자 (bcrypt 제한)
- 복잡도: 소문자 + 숫자 + 특수문자 필수
- 검증 순서: 최소 길이 → 최대 길이 → 소문자 → 숫자 → 특수문자

### 4. JWT 알고리즘: HS256 (HMAC-SHA256)

**결정:** HS256 알고리즘만 허용, none 및 다른 알고리즘 거부

**이유:**
- 대칭키 방식으로 단일 서버 환경에 적합
- 검증 속도 빠름
- none 알고리즘 공격 방어

**대안 고려:**
- RS256: 비대칭키 방식, 마이크로서비스 환경에 유리하나 현재 불필요
- ES256: 타원곡선 암호화, 과도한 복잡도

**JWT 페이로드:**
```typescript
{
  sub: string,        // 사용자 id (문자열)
  accountId: string,  // accountId
  iat: number,        // 발급 시각
  exp: number         // 만료 시각
  // email은 민감 정보이므로 페이로드에 포함하지 않음
  // 필요 시 DB 조회로 최신 email 확인
}
```

### 5. Rate Limiting: accountId+IP 기반 잠금

**결정:** accountId와 IP 조합을 키로 하여 5분 내 10회 실패 시 10분간 잠금

**이유:**
- accountId만 사용 시: 공격자가 다른 IP로 공격 가능
- IP만 사용 시: 동일 IP의 정상 사용자 피해 (NAT 환경)
- accountId+IP 조합: 특정 계정에 대한 특정 IP의 공격만 차단

**대안 고려:**
- IP 기반 전역 제한: 정상 사용자 피해 가능성
- accountId 기반 전역 잠금: 공격자가 여러 IP로 공격 시 무력화

**구현:**
- **프로덕션**: Redis (다중 서버 환경 대응)
- **개발/테스트**: in-memory 카운터 (단일 서버)
- 키: `ratelimit:${accountId}:${ip}`
- TTL: 5분
- 로그인 성공 시 카운터 초기화

### 6. GraphQL 에러 형식: HTTP 200 + extensions.code

**결정:** 모든 비즈니스 에러는 HTTP 200 반환, `errors[].extensions.code`에 에러 코드 명시

**이유:**
- GraphQL 표준 관례 (네트워크 에러와 비즈니스 에러 분리)
- 프론트엔드가 에러 코드로 분기 처리 가능
- 일관된 에러 처리 구조

**에러 코드 목록:**
- `ACCOUNT_ID_ALREADY_EXISTS`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `ACCOUNT_TEMPORARILY_LOCKED`
- `UNAUTHORIZED`
- `PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG`
- `PASSWORD_MISSING_LOWERCASE` / `PASSWORD_MISSING_NUMBER` / `PASSWORD_MISSING_SPECIAL_CHAR`
- `INVALID_ACCOUNT_ID_LENGTH` / `INVALID_ACCOUNT_ID_FORMAT`
- `INVALID_EMAIL_FORMAT`
- `NAME_REQUIRED` / `NAME_TOO_LONG`

### 7. Passport JWT Strategy 사용

**결정:** @nestjs/passport와 passport-jwt 사용

**이유:**
- NestJS 공식 인증 패턴
- Passport 생태계의 검증된 JWT Strategy
- Guard와 자연스럽게 통합

**대안 고려:**
- 직접 JWT 검증 구현: 보안 버그 위험, 재사용성 낮음

**Guard 구조:**
- `JwtAuthGuard`: `@UseGuards` 데코레이터로 Resolver 보호
- `@CurrentUser` 데코레이터: JWT 페이로드에서 사용자 정보 추출
- `GqlExecutionContext` 사용: GraphQL 컨텍스트 지원

### 8. 이메일 검증: class-validator @IsEmail()

**결정:** class-validator의 `@IsEmail()` 데코레이터 사용, 소문자 정규화

**이유:**
- NestJS 표준 검증 라이브러리
- RFC 5322 기반 검증
- 커스텀 정규식보다 안정적

**정규화 규칙:**
- 저장 전 소문자 변환
- 고유성 비교 시 대소문자 무시
- 공백 제거 (trim)

### 9. Prisma Schema: User 모델

**결정:** Prisma schema에 User 모델 정의

```prisma
model User {
  id           String   @id @default(cuid())
  accountId    String   @unique
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}
```

**이유:**
- accountId와 email 모두 unique 제약조건
- passwordHash는 원본 비밀번호 절대 저장 안 함
- createdAt/updatedAt 자동 관리

## Risks / Trade-offs

### [Risk] JWT 탈취 시 만료 전까지 무효화 불가
**Mitigation:**
- 짧은 만료 시간 (15분 기본값)
- httpOnly 쿠키로 XSS 공격 최소화
- 향후 refresh token + access token 패턴으로 전환 고려

### [Risk] Rate limiting 우회 (여러 accountId 시도)
**Mitigation:**
- IP 기반 전역 rate limit 추가 고려 (예: 동일 IP에서 시간당 100회)
- 모니터링 및 이상 탐지 시스템 구축 필요

### [Risk] bcrypt 계산 비용으로 인한 성능 이슈
**Trade-off:**
- Salt rounds 10은 보안과 성능의 균형점
- 로그인 빈도가 높지 않아 허용 가능 (회원가입/로그인만 영향)
- 필요 시 캐싱 레이어 추가 고려

### [Risk] 쿠키 기반 인증의 모바일 앱 호환성
**Mitigation:**
- 모바일 WebView는 쿠키 지원
- 네이티브 앱 개발 시 Authorization 헤더 옵션도 지원 검토

### [Risk] GraphQL 구조상 CSRF 공격 가능성
**Mitigation:**
- sameSite=Strict (프로덕션) / Lax (개발) 설정
- GraphQL Mutation은 POST 요청만 허용

### [Risk] accountId+IP 잠금으로 인한 정상 사용자 피해
**Trade-off:**
- 동일 계정에 다른 IP에서 로그인 시도 시 독립적으로 처리
- 10분 잠금은 짧은 편 (과도한 불편 최소화)
- 로그인 성공 시 카운터 초기화로 정상 사용 보장

## Migration Plan

### 1. 환경 변수 설정
```bash
JWT_SECRET=<32자 이상 랜덤 문자열>
JWT_EXPIRES_IN=15m
NODE_ENV=development|production
```

### 2. 의존성 설치
```bash
pnpm add @nestjs/passport @nestjs/jwt passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
```

### 3. Prisma Migration
```bash
# User 모델 추가 후
npx prisma migrate dev --name add-user-model
```

### 4. 배포 순서 (Zero-downtime)
1. 데이터베이스 마이그레이션 실행
2. 백엔드 배포 (인증 API 활성화)
3. 프론트엔드 기존 코드와 호환 확인
4. 모니터링 (에러율, 로그인 성공률)

### 5. Rollback 전략
- Prisma migration down: `npx prisma migrate resolve --rolled-back <migration_name>`
- 이전 버전 백엔드로 롤백
- JWT_SECRET 변경 시 모든 기존 세션 무효화됨 (주의)

## Open Questions

### Q1 (P2): Refresh token 도입 시기는?
**현재 결정:** Access token만 구현, refresh token은 추후 필요 시 추가
**고려사항:** 사용자 불편(15분마다 재로그인) vs 구현 복잡도
**우선순위**: MVP 후 사용자 피드백 기반 결정

### Q2 (P3): 비밀번호 정책은 변경 가능한가?
**현재 결정:** 하드코딩 (10-72자, 소문자+숫자+특수문자)
**고려사항:** 환경 변수나 DB 설정으로 동적 변경 필요성
**우선순위**: 보안팀 요구사항 발생 시 구현

### Q3 (P3): 계정 잠금 해제 방법은?
**현재 결정:** 시간 경과(10분) 자동 해제
**고려사항:** 관리자 수동 해제 API 필요 여부
**우선순위**: 고객 지원 프로세스 확립 후 검토

### Q4 (P2): 동시 로그인 세션 제한은?
**현재 결정:** 제한 없음 (여러 기기에서 로그인 가능)
**고려사항:** 향후 세션 관리 테이블로 제한 추가 여부
**우선순위**: 보안 요구사항 또는 사용자 피드백 기반 결정

### Q5 (P1): JWT_SECRET 로테이션 전략은?
**현재 결정:** 수동 변경 (모든 세션 무효화)
**고려사항:** 무중단 키 로테이션 메커니즘 필요 여부
**우선순위**: 프로덕션 배포 전 필수 검토
