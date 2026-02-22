## ADDED Requirements

### Requirement: 공개 전용 라우트는 인증 사용자 접근을 제한해야 한다

시스템은 `/login`, `/sign-up`를 공개 전용(public-only) 라우트로 취급해야 한다(MUST). 이미 인증된 사용자는 해당 라우트에 머무르지 않도록 리다이렉트해야 한다(MUST). 본 change에서 공개 전용 라우트의 인증 성공 리다이렉트 목적지는 `/me`로 고정해야 한다(MUST).

#### Scenario: 인증 사용자의 로그인 라우트 접근

- **WHEN** 인증된 사용자가 `/login`에 접근한다
- **THEN** 시스템은 `/me`로 리다이렉트한다

#### Scenario: 인증 사용자의 회원가입 라우트 접근

- **WHEN** 인증된 사용자가 `/sign-up`에 접근한다
- **THEN** 시스템은 `/me`로 리다이렉트한다

### Requirement: 보호 라우트는 비인증 접근을 차단해야 한다

시스템은 `/posts`, `/me` 및 후속 탭 영역 라우트를 보호 라우트로 처리해야 한다(MUST). 1차 접근 차단은 Next.js Middleware(서버 사이드)에서 수행해야 하며(MUST), 화면 진입 후 필요 시 클라이언트 `me` 조회로 인증 상태를 확정해야 한다(MUST). 비인증 사용자는 로그인 페이지로 이동해야 한다(MUST).

#### Scenario: 비인증 사용자의 보호 라우트 접근

- **WHEN** 비인증 사용자가 `/posts` 또는 `/me`에 접근한다
- **THEN** 시스템은 `/login`으로 리다이렉트한다
