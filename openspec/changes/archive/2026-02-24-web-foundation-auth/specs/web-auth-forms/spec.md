## ADDED Requirements

### Requirement: 로그인 폼은 accountId/password 입력으로 인증을 요청해야 한다

시스템은 로그인 화면에서 `accountId`, `password` 필드를 제공하고 GraphQL `login(input)` 요청으로 제출해야 한다(MUST). 입력 필드명은 API 계약과 동일한 camelCase를 사용해야 한다(MUST).

#### Scenario: 로그인 폼 제출 성공

- **WHEN** 사용자가 올바른 `accountId`와 `password`를 입력하고 제출한다
- **THEN** 시스템은 `login(input)` 호출을 수행하고 성공 시 보호 영역 기본 진입 페이지(`/me`)로 이동한다

#### Scenario: 필수 입력 누락

- **WHEN** 사용자가 `accountId` 또는 `password`를 비운 상태로 제출한다
- **THEN** 시스템은 요청을 전송하지 않고 필수 입력 오류를 표시한다

### Requirement: 회원가입 폼은 accountId/password/email/name 입력을 지원해야 한다

시스템은 회원가입 화면에서 `CreateUserInput` 구조(`accountId`, `password`, `email`, `name`)에 맞는 입력 필드를 제공해야 한다(MUST).

#### Scenario: 회원가입 폼 제출 성공

- **WHEN** 사용자가 유효한 4개 필드를 입력하고 제출한다
- **THEN** 시스템은 `createUser(input)` 요청을 전송하고 성공 시 로그인 진입 흐름으로 이동한다

#### Scenario: 회원가입 입력 오류

- **WHEN** 사용자가 백엔드 검증 규칙을 위반한 값을 제출한다
- **THEN** 시스템은 실패 응답을 사용자에게 표시하고 폼은 재입력 가능 상태를 유지한다

### Requirement: 소셜 로그인 버튼은 비활성 상태로 노출되어야 한다

시스템은 Apple, Kakao, GitHub 소셜 로그인 버튼을 UI로 노출하되 실제 인증 흐름을 시작하지 않아야 한다(MUST). 버튼에는 준비 중 상태를 인지할 수 있는 표현을 제공해야 한다(SHALL).

#### Scenario: 소셜 버튼 클릭

- **WHEN** 사용자가 소셜 로그인 버튼을 클릭한다
- **THEN** 시스템은 OAuth 요청을 시작하지 않고 비활성/준비 중 상태 안내만 표시한다
