# Post Timeline Specification

## Purpose

게시물 타임라인 조회 API의 Connection 응답 형식, 인증 경계, 커서 페이지네이션 정렬/동작 규칙을 정의한다.

## Requirements

### Requirement: `posts`는 Relay Cursor Connection 형태를 반환해야 한다

시스템은 GraphQL Query `posts`를 통해 커서 기반 타임라인을 제공해야 한다(MUST). 응답은 `edges(node, cursor)`와 `pageInfo(hasNextPage, endCursor)`를 포함하는 Connection 형태여야 한다(MUST).

#### Scenario: 첫 페이지 타임라인 조회

- **WHEN** 사용자가 커서 없이 `posts(first: N)`를 조회한다
- **THEN** 시스템은 첫 페이지 `edges`와 `pageInfo`를 반환한다

#### Scenario: 페이지 끝 정보 제공

- **WHEN** 시스템이 타임라인 응답을 반환한다
- **THEN** 응답에는 다음 페이지 조회 가능 여부를 나타내는 `hasNextPage`와 다음 커서 기준인 `endCursor`가 포함된다

### Requirement: `posts` 타임라인 조회는 인증 사용자에게만 허용되어야 한다

시스템은 `posts` 조회를 인증 사용자로 제한해야 한다(MUST). 비인증 요청은 인증 오류로 거부해야 한다(MUST).

#### Scenario: 인증 사용자 타임라인 조회

- **WHEN** 인증된 사용자가 `posts`를 조회한다
- **THEN** 시스템은 타임라인 Connection 응답을 반환한다

#### Scenario: 비인증 사용자 타임라인 조회

- **WHEN** 비인증 사용자가 `posts`를 조회한다
- **THEN** 시스템은 `UNAUTHORIZED` 인증 오류를 반환한다

### Requirement: 타임라인 정렬은 `createdAt DESC, id DESC`를 보장해야 한다

시스템은 타임라인 게시물을 `createdAt` 내림차순, 동률일 때 `id` 내림차순으로 정렬해야 한다(MUST). 이 정렬 규칙은 모든 페이지에서 일관되어야 한다(MUST).

#### Scenario: 서로 다른 생성 시각의 게시물 정렬

- **WHEN** 생성 시각이 다른 게시물들이 타임라인에 존재한다
- **THEN** 시스템은 최신 `createdAt` 게시물을 먼저 반환한다

#### Scenario: 동일 생성 시각의 게시물 정렬

- **WHEN** 동일한 `createdAt` 값을 가진 게시물이 여러 개 존재한다
- **THEN** 시스템은 `id` 내림차순으로 순서를 고정해 반환한다

### Requirement: 커서 페이지네이션은 중복/누락 없이 다음 페이지를 조회해야 한다

시스템은 `after` 커서를 사용해 다음 페이지를 조회할 수 있어야 하며(MUST), 이전 페이지와 중복 없이 연속된 결과를 반환해야 한다(MUST).

#### Scenario: 다음 페이지 조회 성공

- **WHEN** 사용자가 이전 응답의 `endCursor`로 `posts(first: N, after: cursor)`를 호출한다
- **THEN** 시스템은 해당 커서 이후 게시물 집합을 반환한다

#### Scenario: 페이지 간 중복 방지

- **WHEN** 사용자가 연속된 커서 페이지를 조회한다
- **THEN** 시스템은 같은 게시물을 서로 다른 페이지에 중복 반환하지 않는다

#### Scenario: 페이지네이션 도중 소프트 삭제 발생

- **WHEN** 사용자가 첫 페이지를 조회한 뒤 다음 페이지 조회 전에 중간 게시물이 소프트 삭제된다
- **THEN** 시스템은 삭제된 게시물을 제외하고 커서 이후 결과를 연속성 있게 반환한다

### Requirement: 타임라인은 소프트 삭제된 게시물을 포함하지 않아야 한다

시스템은 `posts` 결과에서 소프트 삭제된 게시물을 제외해야 한다(MUST).

#### Scenario: 소프트 삭제 게시물 제외

- **WHEN** 타임라인에 소프트 삭제된 게시물이 존재한다
- **THEN** 시스템은 해당 게시물을 `posts` 결과에 포함하지 않는다

### Requirement: 역방향 페이지네이션(`before`/`last`)은 이번 범위에서 지원하지 않아야 한다

시스템은 이번 변경 범위에서 `before` 또는 `last` 파라미터를 지원하지 않아야 한다(MUST).

#### Scenario: `before` 또는 `last` 사용 요청

- **WHEN** 사용자가 `posts` 조회에 `before` 또는 `last`를 전달한다
- **THEN** 시스템은 지원하지 않는 파라미터로 검증 오류를 반환한다
