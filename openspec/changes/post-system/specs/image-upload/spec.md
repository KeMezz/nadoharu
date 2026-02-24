## ADDED Requirements

### Requirement: 시스템은 게시물 이미지 업로드용 presigned URL 발급 기능을 제공해야 한다

시스템은 S3 호환 스토리지 업로드를 위한 presigned URL 발급 기능을 제공해야 한다(MUST). 발급 요청에는 최소 `contentType`, `fileSize` 메타데이터가 포함되어야 하며(MUST), 시스템은 이 메타데이터를 검증해야 한다(MUST). 발급 응답에는 업로드에 사용할 URL과 저장 대상 식별 정보(객체 키 또는 접근 URL)가 포함되어야 한다(MUST).

#### Scenario: 업로드 URL 발급 성공

- **WHEN** 인증된 사용자가 유효한 이미지 메타데이터로 URL 발급을 요청한다
- **THEN** 시스템은 presigned URL과 저장 대상 식별 정보를 반환한다

#### Scenario: 비인증 사용자의 URL 발급 시도

- **WHEN** 비인증 사용자가 업로드 URL 발급을 요청한다
- **THEN** 시스템은 인증 오류를 반환한다

#### Scenario: 파일 크기 메타데이터 누락 요청

- **WHEN** 사용자가 `fileSize` 없이 업로드 URL 발급을 요청한다
- **THEN** 시스템은 검증 오류를 반환하고 URL을 발급하지 않는다

### Requirement: 이미지 포맷은 넓게 허용하되 정책에 맞는 포맷만 허용해야 한다

시스템은 `jpeg`, `jpg`, `png`, `webp`, `heic`, `heif`, `gif` 포맷을 허용해야 한다(MUST). 허용되지 않은 포맷 요청은 거부해야 한다(MUST).

#### Scenario: GIF 포맷 업로드 URL 발급

- **WHEN** 사용자가 `gif` 포맷 이미지 업로드 URL 발급을 요청한다
- **THEN** 시스템은 요청을 허용하고 URL을 발급한다

#### Scenario: 미허용 포맷 요청

- **WHEN** 사용자가 허용 목록에 없는 포맷으로 업로드 URL 발급을 요청한다
- **THEN** 시스템은 검증 오류를 반환하고 URL을 발급하지 않는다

### Requirement: 파일 용량 제한은 이미지당 5MB를 초과할 수 없다

시스템은 이미지당 최대 5MB 용량 정책을 강제해야 한다(MUST). 시스템은 URL 발급 단계에서 요청 `fileSize`가 5MB를 초과하면 거부해야 하며(MUST), presigned URL 서명에 요청 `fileSize`(Content-Length)를 반영해 스토리지 업로드 단계에서도 불일치/초과 업로드를 차단해야 한다(MUST).

#### Scenario: 용량 제한 이하 파일

- **WHEN** 사용자가 5MB 이하 이미지를 업로드하려고 한다
- **THEN** 시스템은 업로드를 허용한다

#### Scenario: 용량 제한 초과 파일

- **WHEN** 사용자가 5MB를 초과하는 이미지를 업로드하려고 한다
- **THEN** 시스템은 검증 오류를 반환하고 업로드를 허용하지 않는다

#### Scenario: 스토리지 업로드 단계의 Content-Length 불일치 차단

- **WHEN** 사용자가 발급된 URL로 5MB를 초과한 콘텐츠 길이로 업로드를 시도한다
- **THEN** 스토리지 계층은 서명된 Content-Length 조건 불일치로 업로드를 거부한다

### Requirement: 게시물 저장 시 발급된 허용 경로의 이미지 URL만 수용해야 한다

시스템은 `createPost`와 `updatePost`에서 이미지 URL이 발급 정책에 맞는 버킷/경로인지 검증해야 한다(MUST). 발급되지 않은 외부 URL 또는 허용되지 않은 경로는 거부해야 한다(MUST).

#### Scenario: 발급된 경로 URL로 게시물 저장

- **WHEN** 사용자가 발급 정책에 맞는 이미지 URL로 게시물을 저장한다
- **THEN** 시스템은 게시물 저장을 허용한다

#### Scenario: 외부 URL로 게시물 저장 시도

- **WHEN** 사용자가 발급 정책과 무관한 외부 도메인 URL을 이미지로 전달한다
- **THEN** 시스템은 검증 오류를 반환하고 게시물 저장을 거부한다

### Requirement: 업로드 객체 키는 사용자별 prefix를 강제해야 한다

시스템은 업로드 객체 키를 `users/{userId}/posts/` prefix 규칙으로 발급해야 한다(MUST). 게시물 저장 단계에서도 현재 사용자와 URL 키의 사용자 prefix가 일치하는지 검증해야 한다(MUST).

#### Scenario: 현재 사용자 prefix로 URL 발급

- **WHEN** 사용자가 업로드 URL 발급을 요청한다
- **THEN** 시스템은 요청 사용자 ID를 포함한 prefix 키로 URL을 발급한다

#### Scenario: 타 사용자 prefix URL로 게시물 저장 시도

- **WHEN** 사용자가 다른 사용자 prefix(`users/{otherUserId}/posts/`)의 URL을 이미지로 전달한다
- **THEN** 시스템은 검증 오류를 반환하고 게시물 저장을 거부한다
