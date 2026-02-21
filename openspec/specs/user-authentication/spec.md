# User Authentication Specification

## Purpose

사용자 로그인 흐름에서 자격 증명 검증, 쿠키 기반 JWT 전달, 실패 처리 정책을 정의한다.

## Requirements

### Requirement: 사용자는 accountId와 password로 로그인할 수 있다

시스템은 GraphQL Mutation `login`을 통해 사용자 인증을 수행해야 한다(MUST). 입력값은 accountId와 password를 포함해야 한다(MUST).

#### Scenario: 유효한 자격 증명으로 로그인 성공

- **WHEN** 사용자가 올바른 accountId와 password를 제공한다
- **THEN** 시스템은 사용자 정보를 반환하고 JWT 토큰을 httpOnly 쿠키로 설정한다

#### Scenario: 존재하지 않는 accountId로 로그인 시도

- **WHEN** 사용자가 등록되지 않은 accountId를 제공한다
- **THEN** 시스템은 `INVALID_CREDENTIALS` 에러를 반환한다

#### Scenario: 잘못된 비밀번호로 로그인 시도

- **WHEN** 사용자가 올바른 accountId지만 잘못된 password를 제공한다
- **THEN** 시스템은 `INVALID_CREDENTIALS` 에러를 반환한다

### Requirement: 비밀번호 검증은 bcrypt compare를 사용해야 한다

시스템은 사용자가 제공한 원본 비밀번호와 데이터베이스에 저장된 해시 비밀번호를 bcrypt.compare()를 사용하여 비교해야 한다(MUST).

#### Scenario: bcrypt compare로 비밀번호 일치 확인

- **WHEN** 사용자가 올바른 비밀번호를 제공한다
- **THEN** bcrypt.compare()는 true를 반환하고 인증이 성공한다

#### Scenario: bcrypt compare로 비밀번호 불일치 확인

- **WHEN** 사용자가 잘못된 비밀번호를 제공한다
- **THEN** bcrypt.compare()는 false를 반환하고 인증이 실패한다

### Requirement: JWT 토큰은 httpOnly 쿠키로만 설정되어야 한다

시스템은 발급된 JWT 토큰을 httpOnly, secure, sameSite 속성이 설정된 쿠키로만 클라이언트에 전송해야 한다(MUST). 토큰은 응답 본문에 포함되지 않아야 한다(MUST). 이는 XSS 공격을 방지하기 위함이다.

#### Scenario: httpOnly 쿠키로만 토큰 전달

- **WHEN** 로그인이 성공한다
- **THEN** JWT 토큰은 Set-Cookie 헤더에만 포함되고 응답 본문에는 포함되지 않는다

#### Scenario: httpOnly 속성 설정

- **WHEN** 로그인이 성공한다
- **THEN** 응답 헤더에 httpOnly=true인 Set-Cookie가 포함된다

#### Scenario: secure 및 sameSite 속성 설정

- **WHEN** 프로덕션 환경(NODE_ENV=production)에서 로그인이 성공한다
- **THEN** 쿠키에 secure=true, sameSite=Strict 속성이 설정된다

#### Scenario: 개발 환경에서 secure 속성 비활성화

- **WHEN** 개발 환경(NODE_ENV=development)에서 로그인이 성공한다
- **THEN** 쿠키에 secure=false, sameSite=Lax 속성이 설정된다

### Requirement: JWT 쿠키는 명확한 속성을 가져야 한다

시스템은 JWT 쿠키의 이름, path, domain, maxAge를 명확히 정의해야 한다(MUST). 쿠키명은 "accessToken"이어야 하며(MUST), path는 "/"이어야 하고(MUST), domain은 설정하지 않아야 한다(host-only 쿠키)(MUST). maxAge는 JWT_EXPIRES_IN 환경 변수 값과 일치해야 한다(MUST).

#### Scenario: 쿠키명 "accessToken" 사용

- **WHEN** 로그인이 성공한다
- **THEN** Set-Cookie 헤더의 쿠키명은 "accessToken"이다

#### Scenario: path="/" 설정

- **WHEN** 로그인이 성공한다
- **THEN** 쿠키의 path 속성은 "/"이다

#### Scenario: domain 속성 미설정 (host-only)

- **WHEN** 로그인이 성공한다
- **THEN** 쿠키에 domain 속성이 설정되지 않아 현재 호스트에만 적용된다

#### Scenario: maxAge와 JWT_EXPIRES_IN 일치

- **WHEN** JWT_EXPIRES_IN이 "15m"으로 설정된 상태에서 로그인이 성공한다
- **THEN** 쿠키의 maxAge는 900000ms(15분)이다

### Requirement: 로그인 엔드포인트는 무차별 대입 공격으로부터 보호되어야 한다

시스템은 로그인 엔드포인트에 rate limiting을 적용하여 무차별 대입 공격을 방지해야 한다(MUST). accountId와 IP 조합을 키로 하여 5분 내 10회 이상 로그인 실패 시 해당 accountId+IP를 10분간 잠금해야 한다(MUST). 로그인 성공 시 카운터를 초기화해야 한다(MUST). 단일 인스턴스 환경에서는 인메모리 저장소를 사용할 수 있고(SHOULD), 다중 인스턴스 환경에서는 Redis 같은 공유 저장소를 사용해야 한다(MUST).

#### Scenario: 정상적인 로그인 시도 허용

- **WHEN** 특정 accountId+IP에서 5분 내 10회 미만으로 로그인을 시도한다
- **THEN** 시스템은 정상적으로 인증을 수행한다

#### Scenario: 과도한 실패 시 계정+IP 잠금

- **WHEN** 동일한 accountId+IP 조합에서 5분 내 10회 로그인에 실패한다
- **THEN** 시스템은 `ACCOUNT_TEMPORARILY_LOCKED` 에러를 반환하고 해당 accountId+IP를 10분간 차단한다

#### Scenario: 로그인 성공 시 카운터 초기화

- **WHEN** 로그인 실패 후 성공한다
- **THEN** 해당 accountId+IP의 실패 카운터가 0으로 초기화된다

#### Scenario: 잠금 해제 후 로그인 허용

- **WHEN** accountId+IP 잠금 후 10분이 경과한다
- **THEN** 시스템은 해당 accountId+IP에서 다시 로그인을 허용한다

### Requirement: 로그인 실패 시 구체적인 에러 정보를 노출하지 않는다

시스템은 accountId가 존재하지 않는 경우와 비밀번호가 틀린 경우 모두 동일한 `INVALID_CREDENTIALS` 에러를 반환해야 한다(MUST). 이는 계정 존재 여부 노출을 방지하기 위함이다.

#### Scenario: 존재하지 않는 계정과 잘못된 비밀번호의 동일한 에러

- **WHEN** 사용자가 존재하지 않는 accountId 또는 잘못된 password를 제공한다
- **THEN** 두 경우 모두 동일한 `INVALID_CREDENTIALS` 에러 메시지를 반환한다

#### Scenario: 에러 메시지에 힌트 포함 금지

- **WHEN** 로그인이 실패한다
- **THEN** 에러 메시지는 "계정을 찾을 수 없음" 또는 "비밀번호 불일치" 같은 구체적인 정보를 포함하지 않는다

### Requirement: GraphQL 에러는 표준 형식으로 반환되어야 한다

시스템은 로그인 실패 시 GraphQL errors 배열에 에러 정보를 포함해야 하며(MUST), extensions.code 필드에 에러 코드를 명시해야 한다(MUST). HTTP 응답 상태 코드는 200이어야 한다(MUST).

#### Scenario: GraphQL 에러 구조

- **WHEN** 로그인이 실패한다
- **THEN** 응답은 HTTP 200이며 `errors[0].extensions.code`가 `INVALID_CREDENTIALS`이다

#### Scenario: 계정 잠금 시 에러 코드

- **WHEN** 계정이 잠긴 상태에서 로그인을 시도한다
- **THEN** 응답은 HTTP 200이며 `errors[0].extensions.code`가 `ACCOUNT_TEMPORARILY_LOCKED`이다

### Requirement: 로그인 성공 시 사용자 정보를 함께 반환한다

시스템은 로그인 성공 시 사용자 정보(id, accountId, email, name)를 반환해야 한다(MUST). 비밀번호 해시는 응답에 포함되지 않아야 한다(MUST).

#### Scenario: 로그인 응답에 사용자 정보 포함

- **WHEN** 로그인이 성공한다
- **THEN** 응답에는 user 객체가 포함된다

#### Scenario: 응답에 비밀번호 제외

- **WHEN** 로그인 응답을 받는다
- **THEN** user 객체에는 password 필드가 포함되지 않는다
