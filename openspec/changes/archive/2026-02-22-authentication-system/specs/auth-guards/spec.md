# Auth Guards Specification

## ADDED Requirements

### Requirement: 인증이 필요한 GraphQL Resolver는 가드로 보호되어야 한다
시스템은 인증이 필요한 GraphQL Resolver에 인증 가드(Auth Guard)를 적용하여 보호해야 한다(MUST). 가드는 요청에 유효한 JWT 토큰이 포함되어 있는지 확인해야 한다(MUST).

#### Scenario: 인증된 사용자의 요청 허용
- **WHEN** 유효한 JWT 토큰과 함께 보호된 Resolver를 호출한다
- **THEN** 시스템은 요청을 허용하고 Resolver를 실행한다

#### Scenario: 인증되지 않은 사용자의 요청 거부
- **WHEN** JWT 토큰 없이 보호된 Resolver를 호출한다
- **THEN** 시스템은 `UNAUTHORIZED` 에러를 반환하고 Resolver를 실행하지 않는다

#### Scenario: 만료된 토큰으로 요청 시 거부
- **WHEN** 만료된 JWT 토큰과 함께 보호된 Resolver를 호출한다
- **THEN** 시스템은 `UNAUTHORIZED` 에러를 반환한다

### Requirement: 인증 가드는 JWT 토큰을 자동으로 검증해야 한다
시스템은 인증 가드가 요청 헤더 또는 쿠키에서 JWT 토큰을 추출하고 자동으로 검증해야 한다(MUST). Authorization 헤더가 쿠키보다 우선순위가 높아야 한다(MUST). 토큰 검증은 서명 및 만료 시간 확인을 포함해야 한다(MUST).

#### Scenario: Authorization 헤더에서 토큰 추출
- **WHEN** 요청 헤더에 "Authorization: Bearer <token>"이 포함된다
- **THEN** 가드는 토큰을 추출하고 검증한다

#### Scenario: httpOnly 쿠키에서 토큰 추출
- **WHEN** Authorization 헤더가 없고 "accessToken" 쿠키에 JWT 토큰이 포함된다
- **THEN** 가드는 쿠키에서 토큰을 추출하고 검증한다

#### Scenario: 헤더가 쿠키보다 우선
- **WHEN** Authorization 헤더와 accessToken 쿠키에 모두 토큰이 포함된다
- **THEN** 가드는 Authorization 헤더의 토큰을 사용한다

#### Scenario: 토큰 쿠키명은 "accessToken"
- **WHEN** 가드가 쿠키에서 토큰을 추출한다
- **THEN** 쿠키명 "accessToken"에서 값을 읽는다

### Requirement: 인증된 사용자 정보를 Resolver에서 접근할 수 있어야 한다
시스템은 인증 가드를 통과한 요청의 Resolver에서 현재 인증된 사용자 정보(id, accountId)에 접근할 수 있도록 해야 한다(MUST). 이는 데코레이터(@CurrentUser 등)를 통해 제공되어야 한다(MUST).

#### Scenario: Resolver에서 현재 사용자 정보 접근
- **WHEN** 인증된 요청의 Resolver가 실행된다
- **THEN** Resolver는 @CurrentUser 데코레이터를 통해 현재 사용자의 id와 accountId를 얻을 수 있다

#### Scenario: 사용자 정보로 권한 확인
- **WHEN** Resolver에서 현재 사용자 id를 조회한다
- **THEN** 해당 id를 사용하여 리소스 소유권 또는 권한을 확인할 수 있다

### Requirement: 인증 가드는 NestJS Guard 인터페이스를 구현해야 한다
시스템의 인증 가드는 NestJS의 CanActivate 인터페이스를 구현해야 하며(MUST), @UseGuards 데코레이터로 Resolver 또는 Controller에 적용 가능해야 한다(MUST). GraphQL 컨텍스트에서는 GqlExecutionContext를 사용해야 한다(MUST).

#### Scenario: CanActivate 인터페이스 구현
- **WHEN** 인증 가드를 정의한다
- **THEN** CanActivate 인터페이스의 canActivate() 메서드를 구현한다

#### Scenario: @UseGuards 데코레이터로 적용
- **WHEN** Resolver 또는 Controller에 @UseGuards(AuthGuard)를 적용한다
- **THEN** 해당 엔드포인트는 인증 가드로 보호된다

#### Scenario: GqlExecutionContext 사용
- **WHEN** GraphQL Resolver에서 가드를 실행한다
- **THEN** 가드는 GqlExecutionContext.create()를 사용하여 요청 컨텍스트를 얻는다

### Requirement: 인증 가드는 Passport JWT Strategy를 사용해야 한다
시스템은 Passport의 JWT Strategy를 사용하여 토큰 검증 로직을 구현해야 한다(MUST). @nestjs/passport 패키지를 활용해야 한다(MUST).

#### Scenario: Passport JWT Strategy 등록
- **WHEN** 인증 모듈을 초기화한다
- **THEN** Passport JWT Strategy가 등록되고 사용 가능하다

#### Scenario: JWT Strategy로 토큰 검증
- **WHEN** 보호된 엔드포인트에 요청이 도착한다
- **THEN** Passport JWT Strategy가 자동으로 토큰을 검증하고 페이로드를 추출한다

### Requirement: 인증 실패 시 GraphQL 표준 에러 형식을 반환해야 한다
시스템은 인증 가드에서 인증 실패 시 GraphQL 표준 에러 형식으로 `UNAUTHORIZED` 에러를 반환해야 한다(MUST). HTTP 응답 상태 코드는 200이어야 하며(MUST), 에러 정보는 errors 배열의 extensions.code 필드에 포함되어야 한다(MUST).

#### Scenario: GraphQL 에러 형식 반환
- **WHEN** 인증이 실패한다
- **THEN** 응답은 GraphQL errors 배열에 에러 정보를 포함한다

#### Scenario: HTTP 200 상태 코드 반환
- **WHEN** 인증이 실패한다
- **THEN** HTTP 응답 상태 코드는 200이며, `errors[0].extensions.code`는 `UNAUTHORIZED`이다

#### Scenario: extensions.code에 에러 코드 포함
- **WHEN** 인증이 실패한다
- **THEN** `errors[0].extensions.code` 필드에 `UNAUTHORIZED`가 명시된다

### Requirement: 공개 엔드포인트는 인증 가드를 적용하지 않아야 한다
시스템은 회원가입(createUser)과 로그인(login) 같은 공개 엔드포인트에는 인증 가드를 적용하지 않아야 한다(MUST). 이러한 엔드포인트는 인증 없이 접근 가능해야 한다(MUST).

#### Scenario: 회원가입은 인증 불필요
- **WHEN** 인증되지 않은 사용자가 createUser Mutation을 호출한다
- **THEN** 시스템은 요청을 허용하고 계정을 생성한다

#### Scenario: 로그인은 인증 불필요
- **WHEN** 인증되지 않은 사용자가 login Mutation을 호출한다
- **THEN** 시스템은 요청을 허용하고 인증을 수행한다
