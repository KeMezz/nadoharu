## ADDED Requirements

### Requirement: 이미지 업로드 정책은 shared 정의를 기준으로 프론트와 API가 일관되게 적용해야 한다

시스템은 이미지 업로드 허용 포맷 및 최대 용량 정책을 공유 모듈(`packages/shared`)에서 단일 소스로 관리해야 한다(MUST). 프론트엔드는 해당 정책으로 사전 검증을 수행해야 하며(MUST), API 최종 강제 동작의 상세 규칙은 main `image-upload` spec(`openspec/specs/image-upload/spec.md`)을 기준으로 해석해야 한다(MUST).

#### Scenario: shared 업로드 정책이 프론트와 API에 동시에 반영됨

- **WHEN** 업로드 정책 값이 shared 모듈에서 변경된다
- **THEN** 프론트 사전 검증과 API 최종 검증이 동일한 정책 기준으로 동작한다

#### Scenario: 사전 검증에서 용량 초과 파일 차단

- **WHEN** 사용자가 shared 최대 용량을 초과한 이미지를 선택한다
- **THEN** 프론트엔드는 업로드 요청을 보내지 않고 검증 오류를 표시한다

#### Scenario: 우회 요청에 대한 API 최종 차단 규칙 참조

- **WHEN** 클라이언트 우회로 정책 위반 이미지 메타데이터가 API에 전달된다
- **THEN** 시스템은 `image-upload` main spec의 검증 규칙에 따라 요청을 거부하고 presigned URL을 발급하지 않는다

### Requirement: presigned URL 기반 업로드는 실패 복구와 재시도를 지원해야 한다

시스템은 presigned URL 발급 후 스토리지 업로드를 수행하는 2단계 업로드 흐름을 제공해야 한다(MUST). 업로드 실패 시 원인을 표시하고 같은 파일 또는 재선택 파일로 재시도할 수 있어야 한다(MUST).

#### Scenario: presigned URL 기반 업로드 성공

- **WHEN** 사용자가 유효한 이미지로 업로드를 진행한다
- **THEN** 시스템은 URL 발급과 업로드를 완료하고 결과 이미지를 폼 상태에 반영한다

#### Scenario: 업로드 중 네트워크 오류 발생

- **WHEN** 스토리지 업로드 도중 네트워크 오류가 발생한다
- **THEN** 시스템은 업로드 실패 상태와 재시도 동작을 표시한다

#### Scenario: 업로드 재시도 성공

- **WHEN** 사용자가 실패한 업로드를 재시도한다
- **THEN** 시스템은 업로드를 다시 수행하고 성공 시 실패 상태를 해제한다
