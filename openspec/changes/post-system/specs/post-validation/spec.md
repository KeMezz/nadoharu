## ADDED Requirements

### Requirement: 게시물 텍스트는 최대 150자를 초과할 수 없다

시스템은 `createPost`와 `updatePost` 입력의 텍스트 길이가 150자 이하인지 검증해야 한다(MUST). 150자를 초과하는 텍스트는 거부해야 한다(MUST).

#### Scenario: 150자 이내 텍스트

- **WHEN** 사용자가 150자 이하 텍스트로 게시물을 작성 또는 수정한다
- **THEN** 시스템은 텍스트 검증을 통과시킨다

#### Scenario: 150자 초과 텍스트

- **WHEN** 사용자가 151자 이상 텍스트로 게시물을 작성 또는 수정한다
- **THEN** 시스템은 검증 오류를 반환하고 요청을 거부한다

### Requirement: 게시물 이미지는 최대 4장까지 허용되어야 한다

시스템은 게시물의 이미지 개수를 최대 4장으로 제한해야 한다(MUST). 5장 이상 이미지가 전달되면 요청을 거부해야 한다(MUST).

#### Scenario: 최대 허용 개수(4장) 입력

- **WHEN** 사용자가 이미지 4장으로 게시물을 작성 또는 수정한다
- **THEN** 시스템은 요청을 허용한다

#### Scenario: 허용 개수 초과(5장 이상) 입력

- **WHEN** 사용자가 이미지 5장 이상으로 게시물을 작성 또는 수정한다
- **THEN** 시스템은 검증 오류를 반환하고 요청을 거부한다

### Requirement: `category`는 선택적 자유 문자열이어야 한다

시스템은 `category`를 필수가 아닌 선택 값으로 처리해야 한다(MUST). `category`가 제공된 경우 enum 제한 없이 문자열 값을 수용해야 한다(MUST).

#### Scenario: category 없이 게시물 작성

- **WHEN** 사용자가 `category`를 생략하고 게시물을 작성한다
- **THEN** 시스템은 요청을 허용한다

#### Scenario: 임의 문자열 category 사용

- **WHEN** 사용자가 enum에 속하지 않는 임의 문자열 category를 전달한다
- **THEN** 시스템은 category를 문자열 값으로 수용한다

### Requirement: 검증 실패는 GraphQL 표준 에러 형식으로 반환되어야 한다

시스템은 게시물 검증 실패 시 GraphQL `errors` 배열에 에러 정보를 포함해야 하며(MUST), 클라이언트가 구분 가능한 검증 에러 코드를 `extensions.code`에 제공해야 한다(MUST).

#### Scenario: 텍스트 길이 검증 실패 응답

- **WHEN** 사용자가 길이 제한을 초과한 텍스트를 전송한다
- **THEN** 시스템은 GraphQL 에러 응답과 검증 에러 코드를 반환한다

#### Scenario: 이미지 개수 검증 실패 응답

- **WHEN** 사용자가 허용 개수를 초과한 이미지를 전송한다
- **THEN** 시스템은 GraphQL 에러 응답과 검증 에러 코드를 반환한다
