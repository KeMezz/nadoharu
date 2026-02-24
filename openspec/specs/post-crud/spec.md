# Post CRUD Specification

## Purpose

게시물 생성/수정/삭제/단건 조회 API의 권한, 소프트 삭제, 데이터 갱신 규칙을 정의한다.

## Requirements

### Requirement: 인증 사용자는 `createPost`로 게시물을 생성할 수 있다

시스템은 GraphQL Mutation `createPost`를 제공해야 한다(MUST). `createPost`는 인증된 사용자만 호출할 수 있어야 하며(MUST), 생성된 게시물의 작성자는 현재 인증 사용자로 설정되어야 한다(MUST).

#### Scenario: 인증된 사용자의 게시물 생성 성공

- **WHEN** 인증된 사용자가 유효한 게시물 입력으로 `createPost`를 호출한다
- **THEN** 시스템은 새 게시물을 생성하고 생성된 게시물 정보를 반환한다

#### Scenario: 비인증 사용자의 게시물 생성 시도

- **WHEN** 비인증 사용자가 `createPost`를 호출한다
- **THEN** 시스템은 인증 오류를 반환하고 게시물을 생성하지 않는다

### Requirement: 게시물 수정은 작성자에게만 허용되어야 한다

시스템은 GraphQL Mutation `updatePost`를 제공해야 하며(MUST), 대상 게시물의 작성자만 수정할 수 있어야 한다(MUST). 비작성자의 수정 시도는 권한 오류로 거부되어야 한다(MUST). `imageUrls` 필드가 요청에 포함되면 기존 이미지 목록을 입력 목록으로 전체 교체해야 하며(MUST), `imageUrls`가 생략되면 기존 이미지 목록을 유지해야 한다(MUST).

#### Scenario: 작성자의 게시물 수정 성공

- **WHEN** 게시물 작성자가 `updatePost`로 내용을 수정한다
- **THEN** 시스템은 변경된 게시물을 저장하고 최신 데이터를 반환한다

#### Scenario: 비작성자의 게시물 수정 시도

- **WHEN** 게시물 작성자가 아닌 사용자가 `updatePost`를 호출한다
- **THEN** 시스템은 권한 오류를 반환하고 게시물을 변경하지 않는다

#### Scenario: 수정 요청에 `imageUrls` 포함 시 전체 교체

- **WHEN** 게시물 작성자가 `imageUrls`를 포함해 `updatePost`를 호출한다
- **THEN** 시스템은 기존 이미지 목록을 입력된 목록으로 전체 교체한다

#### Scenario: 수정 요청에 `imageUrls` 미포함 시 기존 유지

- **WHEN** 게시물 작성자가 `imageUrls` 없이 `updatePost`를 호출한다
- **THEN** 시스템은 기존 이미지 목록을 유지한다

### Requirement: 게시물 삭제는 `deletedAt` 기반 소프트 삭제로 처리되어야 한다

시스템은 GraphQL Mutation `deletePost`를 제공해야 하며(MUST), 삭제 요청 시 게시물을 물리 삭제하지 않고 `deletedAt`을 기록해야 한다(MUST). 기본 조회 경로에서는 소프트 삭제된 게시물을 제외해야 한다(MUST).

#### Scenario: 작성자의 게시물 삭제 요청

- **WHEN** 게시물 작성자가 `deletePost`를 호출한다
- **THEN** 시스템은 해당 게시물의 `deletedAt`을 설정하고 기본 조회 대상에서 제외한다

#### Scenario: 비작성자의 게시물 삭제 시도

- **WHEN** 게시물 작성자가 아닌 사용자가 `deletePost`를 호출한다
- **THEN** 시스템은 권한 오류를 반환하고 `deletedAt`을 변경하지 않는다

### Requirement: `post(id)`는 단건 게시물을 조회할 수 있어야 한다

시스템은 GraphQL Query `post(id)`를 제공해야 하며(MUST), 인증 여부와 무관하게 소프트 삭제되지 않은 게시물을 단건 조회할 수 있어야 한다(MUST). 소프트 삭제된 게시물은 조회 결과에서 제외되어야 한다(MUST).

#### Scenario: 존재하는 게시물 단건 조회

- **WHEN** 사용자가 소프트 삭제되지 않은 게시물 ID로 `post(id)`를 조회한다
- **THEN** 시스템은 해당 게시물 정보를 반환한다

#### Scenario: 비인증 사용자의 단건 게시물 조회

- **WHEN** 비인증 사용자가 소프트 삭제되지 않은 게시물 ID로 `post(id)`를 조회한다
- **THEN** 시스템은 해당 게시물 정보를 반환한다

#### Scenario: 소프트 삭제된 게시물 조회

- **WHEN** 사용자가 소프트 삭제된 게시물 ID로 `post(id)`를 조회한다
- **THEN** 시스템은 게시물이 없는 것으로 처리한다
