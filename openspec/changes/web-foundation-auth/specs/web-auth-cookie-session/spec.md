## ADDED Requirements

### Requirement: 인증 성공 상태는 httpOnly accessToken 쿠키로만 관리되어야 한다

시스템은 로그인 성공 후 인증 근거를 httpOnly `accessToken` 쿠키로만 처리해야 한다(MUST). 응답 본문 토큰이나 브라우저 저장소 토큰을 인증 근거로 사용하면 안 된다(MUST NOT).

#### Scenario: 로그인 응답 처리

- **WHEN** `login` 요청이 성공한다
- **THEN** 시스템은 응답 본문 토큰을 저장하지 않고 쿠키 기반 인증 상태로 전환한다

### Requirement: 웹 앱은 토큰을 브라우저 저장소에 저장하지 않아야 한다

시스템은 `localStorage`, `sessionStorage`, 기타 JS 접근 가능한 저장소에 인증 토큰을 보관하면 안 된다(MUST NOT).

#### Scenario: 로그인 후 저장소 확인

- **WHEN** 사용자가 로그인한다
- **THEN** `localStorage`와 `sessionStorage`에는 인증 토큰이 기록되지 않는다

### Requirement: 인증 상태 확정은 me 조회를 통해 수행되어야 한다

시스템은 보호 영역 진입 시 필요하면 `me` 조회로 현재 인증 사용자를 확정해야 한다(MUST). `me` 실패 시 비인증 상태로 처리해야 한다(MUST).

#### Scenario: 유효 쿠키로 인증 사용자 확정

- **WHEN** `accessToken` 쿠키가 유효한 상태에서 보호 화면에 진입한다
- **THEN** 시스템은 `me` 조회로 사용자 정보를 확인하고 화면 접근을 허용한다

#### Scenario: 만료/무효 쿠키 처리

- **WHEN** `accessToken` 쿠키가 만료되었거나 무효여서 `me` 조회가 실패한다
- **THEN** 시스템은 비인증 상태로 전환하고 로그인 흐름으로 이동한다
