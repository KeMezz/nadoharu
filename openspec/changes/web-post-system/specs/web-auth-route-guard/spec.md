## MODIFIED Requirements

> Note: 본 delta는 main spec(`openspec/specs/web-auth-route-guard/spec.md`)의 `/posts` 보호 정책을 수정한다. 아카이브 단계에서 main spec 동기화(`/opsx:sync`)를 수행해야 한다.

### Requirement: 비인증 접근 정책은 라우트별로 구분되어야 한다

시스템은 `/me` 및 후속 탭 영역 라우트를 보호 라우트로 처리해야 하며 비인증 접근을 차단해야 한다(MUST). 시스템은 `/posts`를 비인증 접근 허용 라우트로 처리하되 비인증 사용자에게 로그인 안내 UX를 표시해야 한다(MUST). 시스템은 `/posts/[id]`를 공개 라우트로 처리해야 하며 비인증 접근 시 로그인 리다이렉트를 수행하지 않아야 한다(MUST). 시스템은 작성/수정 라우트(`/posts/new`, `/posts/[id]/edit`)를 보호 라우트로 처리해야 하며 비인증 접근 시 `/login`으로 리다이렉트해야 한다(MUST).

#### Scenario: 비인증 사용자의 보호 라우트(`/me`) 접근

- **WHEN** 비인증 사용자가 `/me`에 접근한다
- **THEN** 시스템은 `/login`으로 리다이렉트한다

#### Scenario: 비인증 사용자의 `/posts` 접근

- **WHEN** 비인증 사용자가 `/posts`에 접근한다
- **THEN** 시스템은 라우트 접근을 허용하고 로그인 안내 UI를 표시한다

#### Scenario: 비인증 사용자의 `/posts/[id]` 접근

- **WHEN** 비인증 사용자가 `/posts/[id]`에 접근한다
- **THEN** 시스템은 라우트 접근을 허용하고 게시물 상세 조회를 진행한다

#### Scenario: 비인증 사용자의 작성 라우트(`/posts/new`) 접근

- **WHEN** 비인증 사용자가 `/posts/new`에 접근한다
- **THEN** 시스템은 `/login`으로 리다이렉트한다

#### Scenario: 비인증 사용자의 수정 라우트(`/posts/[id]/edit`) 접근

- **WHEN** 비인증 사용자가 `/posts/[id]/edit`에 접근한다
- **THEN** 시스템은 `/login`으로 리다이렉트한다
