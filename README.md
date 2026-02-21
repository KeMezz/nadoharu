# Nadoharu

나도하루(Nadoharu) — 일상을 공유하고 공감("나도!")하는 모바일 우선 소셜 플랫폼 모노레포입니다.

## Apps

- `apps/api`: NestJS 11 + GraphQL + Prisma
- `apps/web`: Next.js 16 + React 19

## Authentication System

`apps/api`에 인증 bounded-context가 구현되어 있습니다.

- 회원가입: `createUser`
- 로그인: `login` (JWT를 `httpOnly` 쿠키 `accessToken`으로 설정)
- 보호된 조회: `me` (`JwtAuthGuard` 적용)
- 로그인 rate limit: 동일 `accountId + IP` 기준 5분 내 10회 실패 시 10분 잠금

상세 API 예시와 에러 코드는 `apps/api/README.md`를 참고하세요.

## Quick Start

```bash
pnpm install
docker compose up -d
pnpm dev
```
