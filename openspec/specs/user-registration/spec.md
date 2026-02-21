# User Registration Specification

## Purpose

사용자 회원가입 과정에서 입력값 검증, accountId/email 고유성 보장, 비밀번호 해싱, GraphQL 응답/에러 규칙을 일관되게 정의한다.

## Requirements

### Requirement: 사용자는 accountId, password, email, name으로 회원가입할 수 있다

시스템은 GraphQL Mutation `createUser`를 통해 새 사용자 계정을 생성해야 한다(MUST). 입력값은 accountId(고유 식별자), password(원본 비밀번호), email(이메일 주소), name(사용자 이름)을 포함해야 한다(MUST). GraphQL 필드명은 camelCase를 사용해야 한다(MUST).

#### Scenario: 유효한 정보로 회원가입 성공

- **WHEN** 사용자가 유효한 accountId, password, email, name을 제공한다
- **THEN** 시스템은 새 사용자 레코드를 생성하고 User 객체를 반환한다

#### Scenario: 중복된 accountId로 회원가입 시도

- **WHEN** 사용자가 이미 존재하는 accountId로 회원가입을 시도한다
- **THEN** 시스템은 `ACCOUNT_ID_ALREADY_EXISTS` 에러를 반환한다

#### Scenario: 중복된 email로 회원가입 시도

- **WHEN** 사용자가 이미 등록된 email로 회원가입을 시도한다
- **THEN** 시스템은 `EMAIL_ALREADY_EXISTS` 에러를 반환한다

### Requirement: accountId는 데이터베이스에서 고유해야 한다

시스템은 accountId의 고유성을 데이터베이스 unique 제약조건으로 보장해야 한다(MUST). accountId는 소문자 패턴(`^[a-z0-9_]{3,20}$`)만 허용하므로, 중복 검사는 소문자 기준으로 일관되게 처리해야 한다(MUST).

#### Scenario: 고유한 accountId 허용

- **WHEN** 사용자가 데이터베이스에 존재하지 않는 accountId를 제공한다
- **THEN** 시스템은 accountId를 수락한다

#### Scenario: 중복된 accountId 거부

- **WHEN** 사용자가 이미 등록된 accountId를 제공한다
- **THEN** 시스템은 `ACCOUNT_ID_ALREADY_EXISTS` 에러를 반환한다

### Requirement: accountId는 형식 규칙을 준수해야 한다

시스템은 accountId가 3-20자 길이의 영문 소문자, 숫자, 언더스코어(_)만 포함하는지 검증해야 한다(MUST). 정규식 패턴은 `^[a-z0-9_]{3,20}$`이어야 한다(MUST).

#### Scenario: 유효한 accountId 형식

- **WHEN** 사용자가 "user_123" 같은 유효한 accountId를 제공한다
- **THEN** 시스템은 accountId를 수락한다

#### Scenario: 경계값 - 정확히 3자

- **WHEN** 사용자가 3자 길이의 accountId "abc"를 제공한다
- **THEN** 시스템은 accountId를 수락한다

#### Scenario: 경계값 - 정확히 20자

- **WHEN** 사용자가 20자 길이의 accountId를 제공한다
- **THEN** 시스템은 accountId를 수락한다

#### Scenario: 3자 미만 accountId 거부

- **WHEN** 사용자가 2자 이하의 accountId를 제공한다
- **THEN** 시스템은 `INVALID_ACCOUNT_ID_LENGTH` 에러를 반환한다

#### Scenario: 20자 초과 accountId 거부

- **WHEN** 사용자가 21자 이상의 accountId를 제공한다
- **THEN** 시스템은 `INVALID_ACCOUNT_ID_LENGTH` 에러를 반환한다

#### Scenario: 허용되지 않은 문자 포함

- **WHEN** 사용자가 대문자 또는 특수문자(\_, 제외)를 포함한 accountId를 제공한다
- **THEN** 시스템은 `INVALID_ACCOUNT_ID_FORMAT` 에러를 반환한다

### Requirement: email은 유효한 이메일 형식이어야 한다

시스템은 email 필드가 유효한 이메일 형식인지 검증해야 한다(MUST). 구현은 class-validator의 `@IsEmail()` 또는 동등 수준의 형식 검증 로직을 사용할 수 있다(SHOULD). 이메일 주소는 저장 전 소문자로 정규화되어야 하며(MUST), 고유성 비교 시 대소문자를 구분하지 않아야 한다(MUST).

#### Scenario: 유효한 이메일 형식

- **WHEN** 사용자가 "user@example.com" 같은 유효한 이메일을 제공한다
- **THEN** 시스템은 이메일을 수락한다

#### Scenario: 이메일 소문자 정규화

- **WHEN** 사용자가 "User@Example.COM"을 이메일로 제공한다
- **THEN** 시스템은 "user@example.com"으로 정규화하여 저장한다

#### Scenario: 잘못된 이메일 형식

- **WHEN** 사용자가 "@" 기호가 없거나 도메인이 누락된 이메일을 제공한다
- **THEN** 시스템은 `INVALID_EMAIL_FORMAT` 에러를 반환한다

#### Scenario: 공백 포함 이메일 거부

- **WHEN** 사용자가 공백이 포함된 이메일 "user @example.com"을 제공한다
- **THEN** 시스템은 `INVALID_EMAIL_FORMAT` 에러를 반환한다

### Requirement: name은 1-50자 길이의 문자열이어야 한다

시스템은 사용자 이름(name)이 최소 1자 이상, 최대 50자 이하인지 검증해야 한다(MUST).

#### Scenario: 유효한 이름 길이

- **WHEN** 사용자가 "홍길동" 같은 1-50자 사이의 이름을 제공한다
- **THEN** 시스템은 이름을 수락한다

#### Scenario: 빈 이름

- **WHEN** 사용자가 빈 문자열을 이름으로 제공한다
- **THEN** 시스템은 `NAME_REQUIRED` 에러를 반환한다

#### Scenario: 너무 긴 이름

- **WHEN** 사용자가 50자를 초과하는 이름을 제공한다
- **THEN** 시스템은 `NAME_TOO_LONG` 에러를 반환한다

### Requirement: 비밀번호는 저장 전 해싱되어야 한다

시스템은 사용자가 제공한 원본 비밀번호를 bcrypt를 사용하여 해싱한 후 데이터베이스에 저장해야 한다(MUST). 원본 비밀번호는 절대 저장되지 않아야 한다(MUST).

#### Scenario: 비밀번호 해싱 후 저장

- **WHEN** 사용자가 "MyP@ssw0rd123"을 비밀번호로 제공한다
- **THEN** 시스템은 bcrypt로 해싱된 값을 데이터베이스에 저장한다

#### Scenario: 저장된 비밀번호는 원본과 다름

- **WHEN** 회원가입 후 데이터베이스에 저장된 비밀번호를 조회한다
- **THEN** 저장된 값은 원본 비밀번호와 다른 해시 문자열이다

### Requirement: 회원가입 성공 시 사용자 정보를 반환한다

시스템은 회원가입이 성공하면 생성된 User 객체(id, accountId, email, name, createdAt)를 반환해야 한다(MUST). 비밀번호 해시는 응답에 포함되지 않아야 한다(MUST). GraphQL 응답 필드는 camelCase를 사용해야 한다(MUST).

#### Scenario: 회원가입 성공 응답

- **WHEN** 회원가입이 성공한다
- **THEN** 시스템은 User 객체를 반환하며, password 필드는 포함되지 않는다

#### Scenario: 응답에 id와 createdAt 포함

- **WHEN** 회원가입이 성공한다
- **THEN** 응답에는 고유 식별자(id)와 생성 시각(createdAt)이 camelCase로 포함된다

### Requirement: 회원가입 실패 시 GraphQL 표준 에러 형식을 반환해야 한다

시스템은 회원가입 실패 시 GraphQL errors 배열에 에러 정보를 포함해야 하며(MUST), extensions.code 필드에 에러 코드를 명시해야 한다(MUST). HTTP 응답 상태 코드는 200이어야 한다(MUST).

#### Scenario: GraphQL 에러 구조

- **WHEN** 회원가입이 실패한다
- **THEN** 응답은 HTTP 200이며 `errors[0].extensions.code`에 에러 코드가 포함된다

#### Scenario: 중복 accountId 에러 코드

- **WHEN** 중복된 accountId로 회원가입을 시도한다
- **THEN** `errors[0].extensions.code`가 `ACCOUNT_ID_ALREADY_EXISTS`이다
