# JWT Token Management Specification

## Purpose

JWT 토큰의 발급, 서명, 검증, 만료 및 페이로드 규칙을 일관되게 관리하기 위한 기준을 정의한다.

## Requirements

### Requirement: JWT 토큰은 환경 변수로 설정된 비밀키로 서명되어야 한다

시스템은 `JWT_SECRET` 환경 변수에 정의된 비밀키를 사용하여 JWT 토큰을 서명해야 한다(MUST). 비밀키는 최소 32자 이상이어야 한다(MUST).

#### Scenario: JWT_SECRET 환경 변수 사용

- **WHEN** 시스템이 JWT 토큰을 생성한다
- **THEN** JWT_SECRET 환경 변수의 값으로 토큰을 서명한다

#### Scenario: JWT_SECRET 미설정 시 시작 실패

- **WHEN** JWT_SECRET 환경 변수가 설정되지 않은 상태에서 시스템이 시작된다
- **THEN** 시스템은 초기화 에러를 발생시키고 시작을 중단한다

#### Scenario: JWT_SECRET 길이 부족 시 시작 실패

- **WHEN** JWT_SECRET이 32자 미만으로 설정된 상태에서 시스템이 시작된다
- **THEN** 시스템은 초기화 에러를 발생시키고 시작을 중단한다

### Requirement: JWT 토큰은 HS256 알고리즘으로만 서명되어야 한다

시스템은 JWT 토큰을 서명할 때 HS256 알고리즘만 사용해야 하며(MUST), 검증 시 HS256 알고리즘만 허용해야 한다(MUST). none 알고리즘이나 다른 알고리즘을 사용한 토큰은 거부되어야 한다(MUST).

#### Scenario: HS256 알고리즘으로 서명

- **WHEN** 시스템이 JWT 토큰을 생성한다
- **THEN** 토큰의 헤더 alg 필드는 "HS256"이다

#### Scenario: none 알고리즘 토큰 거부

- **WHEN** alg="none"인 JWT 토큰을 검증한다
- **THEN** 시스템은 `UNAUTHORIZED` 에러를 반환한다

#### Scenario: 다른 알고리즘 토큰 거부

- **WHEN** alg="RS256" 또는 다른 알고리즘의 JWT 토큰을 검증한다
- **THEN** 시스템은 `UNAUTHORIZED` 에러를 반환한다

### Requirement: JWT 토큰의 만료 시간을 설정할 수 있어야 한다

시스템은 `JWT_EXPIRES_IN` 환경 변수를 통해 JWT 토큰의 만료 시간을 설정할 수 있어야 한다(MUST). 기본값은 15분("15m")이어야 한다(MUST).

#### Scenario: 환경 변수로 만료 시간 설정

- **WHEN** JWT_EXPIRES_IN이 "1h"로 설정된 상태에서 토큰을 발급한다
- **THEN** 발급된 토큰의 exp 클레임은 1시간 후로 설정된다

#### Scenario: 기본 만료 시간 적용

- **WHEN** JWT_EXPIRES_IN이 설정되지 않은 상태에서 토큰을 발급한다
- **THEN** 발급된 토큰의 exp 클레임은 15분 후로 설정된다

### Requirement: JWT 토큰에는 사용자 식별 정보가 포함되어야 한다

시스템은 JWT 페이로드에 사용자 id(sub 클레임, 문자열 타입)와 accountId를 포함해야 한다(MUST). 민감한 정보(비밀번호, 이메일)는 포함되지 않아야 한다(MUST). sub 클레임은 항상 문자열로 직렬화되어야 한다(MUST).

#### Scenario: JWT 페이로드에 사용자 id 포함

- **WHEN** 사용자 id가 "123"인 사용자의 JWT 토큰을 발급한다
- **THEN** 토큰의 sub 클레임 값은 문자열 "123"이다

#### Scenario: JWT 페이로드에 accountId 포함

- **WHEN** accountId가 "user_abc"인 사용자의 JWT 토큰을 발급한다
- **THEN** 토큰의 페이로드에 accountId: "user_abc"가 포함된다

#### Scenario: 민감한 정보 제외

- **WHEN** JWT 토큰을 디코딩한다
- **THEN** 페이로드에 password, email 같은 민감한 정보가 포함되지 않는다

#### Scenario: sub 클레임은 문자열 타입

- **WHEN** JWT 토큰을 발급한다
- **THEN** sub 클레임은 숫자가 아닌 문자열 타입이다

### Requirement: JWT 토큰 검증 시 서명과 만료 시간을 확인해야 한다

시스템은 수신한 JWT 토큰의 서명이 유효한지 검증해야 하며(MUST), 토큰이 만료되지 않았는지 확인해야 한다(MUST). 검증 실패 시 `UNAUTHORIZED` 에러를 반환해야 한다(MUST).

#### Scenario: 유효한 JWT 토큰 검증 성공

- **WHEN** 유효한 서명과 만료되지 않은 JWT 토큰을 제공한다
- **THEN** 시스템은 토큰을 수락하고 페이로드를 반환한다

#### Scenario: 잘못된 서명의 JWT 토큰 거부

- **WHEN** 다른 비밀키로 서명된 JWT 토큰을 제공한다
- **THEN** 시스템은 `UNAUTHORIZED` 에러를 반환한다

#### Scenario: 만료된 JWT 토큰 거부

- **WHEN** 만료 시간이 지난 JWT 토큰을 제공한다
- **THEN** 시스템은 `UNAUTHORIZED` 에러를 반환한다

### Requirement: JWT 토큰으로부터 사용자 정보를 추출할 수 있어야 한다

시스템은 검증된 JWT 토큰의 페이로드로부터 사용자 id와 accountId를 추출하여 현재 인증된 사용자 정보를 제공해야 한다(MUST).

#### Scenario: 토큰에서 사용자 id 추출

- **WHEN** 유효한 JWT 토큰을 검증한다
- **THEN** 페이로드의 sub 클레임에서 사용자 id를 추출할 수 있다

#### Scenario: 토큰에서 accountId 추출

- **WHEN** 유효한 JWT 토큰을 검증한다
- **THEN** 페이로드의 accountId 필드를 추출할 수 있다

### Requirement: JWT 토큰 발급 시 iat(issued at) 클레임이 포함되어야 한다

시스템은 JWT 토큰 발급 시 토큰이 생성된 시각을 나타내는 iat 클레임을 자동으로 포함해야 한다(MUST).

#### Scenario: iat 클레임 자동 포함

- **WHEN** JWT 토큰을 발급한다
- **THEN** 토큰의 페이로드에 iat 클레임이 현재 Unix 타임스탬프 값으로 포함된다

#### Scenario: iat 값으로 토큰 발급 시각 확인 가능

- **WHEN** 발급된 JWT 토큰의 iat 클레임을 확인한다
- **THEN** 토큰이 생성된 정확한 시각을 알 수 있다
