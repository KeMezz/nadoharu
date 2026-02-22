# Password Security Specification

## Purpose

회원가입 시 비밀번호 정책 검증과 bcrypt 해싱 규칙을 통해 비밀번호 보안을 보장하기 위한 기준을 정의한다.

## Requirements

### Requirement: 비밀번호는 10-72자 길이여야 한다

시스템은 사용자가 설정하는 비밀번호의 길이가 최소 10자 이상, 최대 72자 이하인지 검증해야 한다(MUST). bcrypt의 입력 제한과 DoS 공격 방지를 위해 72자를 초과하는 비밀번호는 거부되어야 한다(MUST).

#### Scenario: 10자 이상 비밀번호 허용

- **WHEN** 사용자가 "MyP@ssw0rd"(10자)를 비밀번호로 제공한다
- **THEN** 시스템은 비밀번호를 수락한다

#### Scenario: 경계값 - 정확히 72자 허용

- **WHEN** 사용자가 72자 길이의 비밀번호를 제공한다
- **THEN** 시스템은 비밀번호를 수락한다

#### Scenario: 10자 미만 비밀번호 거부

- **WHEN** 사용자가 "Short1!"(7자)를 비밀번호로 제공한다
- **THEN** 시스템은 `PASSWORD_TOO_SHORT` 에러를 반환한다

#### Scenario: 72자 초과 비밀번호 거부

- **WHEN** 사용자가 73자 이상의 비밀번호를 제공한다
- **THEN** 시스템은 `PASSWORD_TOO_LONG` 에러를 반환한다

### Requirement: 비밀번호는 영문 소문자를 포함해야 한다

시스템은 비밀번호에 최소 1개 이상의 영문 소문자(a-z)가 포함되어 있는지 검증해야 한다(MUST). 정규식 `/[a-z]/`를 사용해야 한다(MUST).

#### Scenario: 소문자 포함된 비밀번호 허용

- **WHEN** 사용자가 "MyPassword123!"를 비밀번호로 제공한다
- **THEN** 시스템은 비밀번호를 수락한다

#### Scenario: 소문자 없는 비밀번호 거부

- **WHEN** 사용자가 "MYPASSWORD123!"를 비밀번호로 제공한다
- **THEN** 시스템은 `PASSWORD_MISSING_LOWERCASE` 에러를 반환한다

### Requirement: 비밀번호는 숫자를 포함해야 한다

시스템은 비밀번호에 최소 1개 이상의 숫자(0-9)가 포함되어 있는지 검증해야 한다(MUST). 정규식 `/[0-9]/`를 사용해야 한다(MUST).

#### Scenario: 숫자 포함된 비밀번호 허용

- **WHEN** 사용자가 "MyPassword1!"를 비밀번호로 제공한다
- **THEN** 시스템은 비밀번호를 수락한다

#### Scenario: 숫자 없는 비밀번호 거부

- **WHEN** 사용자가 "MyPassword!"를 비밀번호로 제공한다
- **THEN** 시스템은 `PASSWORD_MISSING_NUMBER` 에러를 반환한다

### Requirement: 비밀번호는 특수문자를 포함해야 한다

시스템은 비밀번호에 최소 1개 이상의 특수문자가 포함되어 있는지 검증해야 한다(MUST). 허용되는 특수문자는 정규식 `/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?]/`로 정의되어야 한다(MUST).

#### Scenario: 특수문자 포함된 비밀번호 허용

- **WHEN** 사용자가 "MyPassword1!"를 비밀번호로 제공한다
- **THEN** 시스템은 비밀번호를 수락한다

#### Scenario: 다양한 특수문자 허용

- **WHEN** 사용자가 "Pass@word1", "Pass#word1", "Pass$word1" 중 하나를 제공한다
- **THEN** 시스템은 모두 수락한다

#### Scenario: 특수문자 없는 비밀번호 거부

- **WHEN** 사용자가 "MyPassword123"을 비밀번호로 제공한다
- **THEN** 시스템은 `PASSWORD_MISSING_SPECIAL_CHAR` 에러를 반환한다

### Requirement: 비밀번호는 bcrypt로 해싱되어야 한다

시스템은 사용자가 제공한 원본 비밀번호를 bcrypt 알고리즘을 사용하여 해싱해야 한다(MUST). bcrypt의 salt rounds는 최소 10 이상이어야 한다(MUST).

#### Scenario: bcrypt로 비밀번호 해싱

- **WHEN** 시스템이 비밀번호를 해싱한다
- **THEN** bcrypt 알고리즘을 사용하여 해시 문자열을 생성한다

#### Scenario: salt rounds 10 이상 사용

- **WHEN** 시스템이 bcrypt로 비밀번호를 해싱한다
- **THEN** salt rounds 파라미터는 최소 10 이상이다

### Requirement: 해싱된 비밀번호는 원본 비밀번호와 달라야 한다

시스템은 해싱된 비밀번호 문자열이 원본 비밀번호와 다른 값임을 보장해야 한다(MUST). 동일한 비밀번호라도 매번 다른 해시가 생성되어야 한다(MUST).

#### Scenario: 해시 값은 원본과 다름

- **WHEN** "MyPassword1!"를 해싱한다
- **THEN** 해시 결과는 "MyPassword1!"와 다른 문자열이다

#### Scenario: 동일한 비밀번호도 매번 다른 해시 생성

- **WHEN** "MyPassword1!"를 두 번 해싱한다
- **THEN** 두 해시 값은 서로 다르다

### Requirement: 비밀번호 정책 위반 시 명확한 에러를 반환해야 한다

시스템은 비밀번호 정책 검증 실패 시 첫 번째로 위반한 규칙에 대한 에러 코드와 메시지를 반환해야 한다(MUST). 검증 순서는 다음과 같다(MUST): 1) 최소 길이(10자), 2) 최대 길이(72자), 3) 영문 소문자, 4) 숫자, 5) 특수문자. 에러 응답은 GraphQL errors 배열의 `extensions.code`와 `message` 필드를 포함해야 한다(MUST).

#### Scenario: 길이 부족 시 명확한 에러

- **WHEN** 10자 미만 비밀번호를 제공한다
- **THEN** 에러 코드는 `PASSWORD_TOO_SHORT`이고, 메시지는 "비밀번호는 최소 10자 이상이어야 합니다"를 포함한다

#### Scenario: 복잡도 부족 시 명확한 에러

- **WHEN** 소문자가 없는 비밀번호를 제공한다
- **THEN** 에러 코드는 `PASSWORD_MISSING_LOWERCASE`이고, 메시지는 "비밀번호는 영문 소문자를 포함해야 합니다"를 포함한다

#### Scenario: 다중 위반 시 첫 번째 에러만 반환

- **WHEN** 9자이고 소문자가 없는 비밀번호를 제공한다
- **THEN** 시스템은 검증 순서상 첫 번째 위반(최소 길이)에 대한 `PASSWORD_TOO_SHORT` 에러만 반환한다

#### Scenario: GraphQL 에러 형식으로 반환

- **WHEN** 비밀번호 정책을 위반한다
- **THEN** 응답은 `errors[0].extensions.code`에 에러 코드를, `errors[0].message`에 메시지를 포함한다

### Requirement: 비밀번호 검증은 회원가입 시점에 수행되어야 한다

시스템은 회원가입(createUser) 시 비밀번호 정책 검증을 수행해야 하며(MUST), 검증 실패 시 사용자 계정을 생성하지 않아야 한다(MUST).

#### Scenario: 회원가입 시 비밀번호 검증

- **WHEN** 사용자가 회원가입을 시도한다
- **THEN** 시스템은 비밀번호 정책을 검증한 후 계정을 생성한다

#### Scenario: 비밀번호 정책 위반 시 계정 미생성

- **WHEN** 정책을 위반한 비밀번호로 회원가입을 시도한다
- **THEN** 시스템은 에러를 반환하고 사용자 계정을 생성하지 않는다
