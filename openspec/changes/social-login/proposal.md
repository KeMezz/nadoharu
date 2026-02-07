## Why

자체 인증(authentication-system)에 이어 소셜 로그인을 구현하여 사용자 유입을 증대하고 가입 장벽을 낮춘다. Apple, Kakao, GitHub OAuth를 지원하여 다양한 플랫폼 사용자가 편리하게 가입/로그인할 수 있도록 한다.

## What Changes

- **OAuth 2.0 인증 플로우**: Authorization Code Grant 방식
- **Apple Sign In**: Sign in with Apple (iOS, Web)
- **Kakao Login**: 카카오 로그인 REST API
- **GitHub OAuth**: GitHub OAuth Apps
- **JWT 토큰 발급**: 소셜 로그인 성공 시 자체 JWT 발급
- **계정 연동**: 소셜 계정과 내부 User 모델 매핑
- **Prisma 스키마**: OAuth 계정 정보 저장 (provider, providerId, refreshToken 암호화 저장)

**선행 요구사항**:
- `authentication-system` 완료 (JWT 토큰 관리 인프라 필요)

## Capabilities

### New Capabilities

- `oauth-apple`: Apple Sign In 인증 플로우 (웹, iOS)
- `oauth-kakao`: 카카오 로그인 REST API 연동
- `oauth-github`: GitHub OAuth Apps 연동
- `oauth-account-linking`: 소셜 계정과 내부 User 연결 관리

### Modified Capabilities

- `jwt-token-management`: 소셜 로그인 시에도 자체 JWT 발급하도록 확장

## Impact

**백엔드 (apps/api)**:
- 새 Prisma 모델: `OAuthAccount` (provider, providerId, userId 외래 키)
- 의존성: `@nestjs/passport`, `passport-apple`, `passport-kakao`, `passport-github2`
- GraphQL Mutation: `loginWithApple`, `loginWithKakao`, `loginWithGithub`
- 환경 변수: 각 OAuth 제공자의 Client ID, Secret, Redirect URI

**프론트엔드 (apps/web)**:
- 소셜 로그인 버튼 동작 구현 (레거시에서 UI만 존재)
- OAuth Redirect 처리

**데이터베이스**:
- PostgreSQL `OAuthAccount` 테이블 생성

**테스트**:
- Unit: OAuth 토큰 검증 로직
- Integration: OAuth 콜백 처리 E2E (Mock OAuth 서버)
