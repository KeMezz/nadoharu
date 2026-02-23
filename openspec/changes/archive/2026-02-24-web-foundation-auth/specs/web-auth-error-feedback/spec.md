## ADDED Requirements

### Requirement: 인증 실패 메시지는 보수적 단일 문구로 표시되어야 한다

시스템은 인증 실패 상황에서 사용자에게 보수적 단일 문구를 표시해야 한다(MUST). 에러 코드별 상세 원인을 직접 노출하면 안 된다(MUST NOT).

#### Scenario: 자격 증명 오류

- **WHEN** `INVALID_CREDENTIALS`가 발생한다
- **THEN** 시스템은 단일 실패 문구를 표시하고 계정 존재 여부에 대한 힌트를 제공하지 않는다

#### Scenario: 잠금 상태 오류

- **WHEN** `ACCOUNT_TEMPORARILY_LOCKED`가 발생한다
- **THEN** 시스템은 단일 실패 문구를 표시하고 잠금 사유/남은 시간 등 상세 원인을 노출하지 않는다

### Requirement: 인증 에러 코드는 중앙 매핑 규칙으로 처리되어야 한다

시스템은 인증 관련 GraphQL 에러 코드(`INVALID_CREDENTIALS`, `ACCOUNT_TEMPORARILY_LOCKED`, `UNAUTHORIZED`)를 중앙 매핑 규칙으로 처리해야 한다(MUST). 화면 컴포넌트별 하드코딩 분기를 두면 안 된다(MUST NOT).

#### Scenario: 중앙 매핑 규칙 사용

- **WHEN** 인증 관련 GraphQL 에러가 수신된다
- **THEN** 시스템은 중앙 매핑 규칙을 통해 사용자 메시지와 후속 동작을 결정한다

### Requirement: UNAUTHORIZED는 재인증 흐름으로 연결되어야 한다

시스템은 보호 영역 요청에서 `UNAUTHORIZED`가 발생하면 현재 세션을 비인증 상태로 정리하고 로그인 흐름으로 유도해야 한다(MUST).

#### Scenario: 보호 화면 요청 실패

- **WHEN** 보호 화면에서 `me` 또는 인증 필요 요청이 `UNAUTHORIZED`를 반환한다
- **THEN** 시스템은 로그인 페이지로 이동시키고 재인증을 안내한다
