# Authentication System - Implementation Tasks

## 1. 환경 설정 및 의존성

- [ ] 1.1 환경 변수 추가 (.env.example, .env): JWT_SECRET, JWT_EXPIRES_IN
- [ ] 1.2 패키지 설치: @nestjs/passport, @nestjs/jwt, passport-jwt, bcrypt
- [ ] 1.3 타입 패키지 설치: @types/passport-jwt, @types/bcrypt

## 2. Prisma Schema 및 Migration

- [ ] 2.1 User 모델 정의 (id, accountId, email, name, passwordHash, createdAt, updatedAt)
  - email 필드에 저장 전 소문자 변환 보장 (애플리케이션 레이어)
  - 또는 Prisma migration에서 LOWER() 함수 기반 unique index 고려
- [ ] 2.2 accountId와 email에 @unique 제약조건 추가
- [ ] 2.3 Prisma migration 생성 및 실행: `npx prisma migrate dev --name add-user-model`
- [ ] 2.4 Prisma Client 재생성: `npx prisma generate`

## 3. Domain Layer - Value Objects

- [ ] 3.1 AccountId VO 구현 (정규식 검증: ^[a-z0-9_]{3,20}$)
- [ ] 3.2 AccountId VO 단위 테스트 (유효/무효 케이스, 경계값)
- [ ] 3.3 Password VO 구현 (정책 검증: 10-72자, 소문자+숫자+특수문자)
- [ ] 3.4 Password VO 단위 테스트 (검증 순서, 다중 위반 시 첫 번째 에러)
- [ ] 3.5 Email VO 구현 (class-validator @IsEmail, 소문자 정규화)
- [ ] 3.6 Email VO 단위 테스트 (유효/무효 형식, 정규화)

## 4. Domain Layer - Entities

- [ ] 4.1 User 엔티티 구현 (id, accountId, email, name, passwordHash)
- [ ] 4.2 User 엔티티 단위 테스트 (생성, VO 검증)
- [ ] 4.3 User 엔티티 팩토리 메서드 (create, reconstitute)

## 5. Domain Layer - Services

- [ ] 5.1 PasswordService 구현 (hash, compare with bcrypt)
- [ ] 5.2 PasswordService 단위 테스트 (해싱, 비교, salt rounds 10)
- [ ] 5.3 PasswordService에서 bcrypt salt rounds 10 설정

## 6. Application Layer - Repository Interface

- [ ] 6.1 IUserRepository 인터페이스 정의 (save, findByAccountId, findByEmail, findById)
- [ ] 6.2 Repository 메서드 시그니처 정의 (Promise 반환 타입)

## 7. Application Layer - Use Cases

- [ ] 7.1 RegisterUserUseCase 구현 (VO 검증, 중복 확인, 비밀번호 해싱, 저장)
- [ ] 7.2 RegisterUserUseCase 단위 테스트 (성공, 중복 accountId, 중복 email, 정책 위반)
- [ ] 7.3 AuthenticateUserUseCase 구현 (계정 조회, bcrypt 검증, JWT 발급)
- [ ] 7.4 AuthenticateUserUseCase 단위 테스트 (성공, 존재하지 않는 계정, 잘못된 비밀번호)

## 8. Infrastructure Layer - Prisma Repository

- [ ] 8.1 PrismaUserRepository 구현 (IUserRepository 구현체)
- [ ] 8.2 PrismaUserRepository.save() 구현 (User 엔티티 → Prisma 모델 매핑)
- [ ] 8.3 PrismaUserRepository.findByAccountId() 구현 (소문자 비교)
- [ ] 8.4 PrismaUserRepository.findByEmail() 구현 (소문자 비교)
- [ ] 8.5 PrismaUserRepository.findById() 구현
- [ ] 8.6 PrismaUserRepository 통합 테스트 (실제 DB 연동)

## 9. Infrastructure Layer - JWT Module

- [ ] 9.1 JwtModule 설정 (JWT_SECRET, JWT_EXPIRES_IN, HS256 알고리즘)
- [ ] 9.2 JWT_SECRET 최소 32자 검증 로직 추가
- [ ] 9.3 JWT_SECRET 미설정 시 시작 실패 처리
- [ ] 9.4 JwtService 래퍼 구현 (sign, verify)
- [ ] 9.5 JwtService 단위 테스트 (토큰 발급, 검증, 만료, none 알고리즘 거부)

## 10. Infrastructure Layer - Passport JWT Strategy

- [ ] 10.1 JwtStrategy 구현 (PassportStrategy 상속)
- [ ] 10.2 JwtStrategy에서 헤더/쿠키 토큰 추출 (헤더 우선)
- [ ] 10.3 JwtStrategy.validate() 구현 (페이로드 → 사용자 정보 반환)
- [ ] 10.4 JwtStrategy 단위 테스트 (유효 토큰, 만료 토큰, 잘못된 서명)

## 11. Infrastructure Layer - Auth Guard

- [ ] 11.1 JwtAuthGuard 구현 (CanActivate 인터페이스)
- [ ] 11.2 JwtAuthGuard에서 GqlExecutionContext 사용
- [ ] 11.3 @CurrentUser 데코레이터 구현 (JWT 페이로드 추출)
- [ ] 11.4 JwtAuthGuard 단위 테스트 (인증 성공, 토큰 없음, 만료 토큰)

## 12. Infrastructure Layer - Rate Limiting

- [ ] 12.1 Rate limiting 서비스 구현 (in-memory 또는 Redis)
- [ ] 12.2 accountId+IP 키 생성 로직 구현
- [ ] 12.3 5분 내 10회 실패 시 10분 잠금 로직
- [ ] 12.4 로그인 성공 시 카운터 초기화 로직
- [ ] 12.5 Rate limiting 서비스 단위 테스트 (정상, 잠금, 해제, 초기화)

## 13. Infrastructure Layer - GraphQL Types

- [ ] 13.1 User GraphQL ObjectType 정의 (id, accountId, email, name, createdAt)
- [ ] 13.2 CreateUserInput InputType 정의 (accountId, password, email, name)
- [ ] 13.3 LoginInput InputType 정의 (accountId, password)
- [ ] 13.4 AuthPayload ObjectType 정의 (user)

## 14. Infrastructure Layer - GraphQL Resolver

- [ ] 14.1 AuthResolver 구현 (Resolver 데코레이터)
- [ ] 14.2 createUser Mutation 구현 (RegisterUserUseCase 호출)
- [ ] 14.3 createUser에 GraphQL 에러 처리 추가 (extensions.code)
- [ ] 14.4 login Mutation 구현 (AuthenticateUserUseCase 호출)
- [ ] 14.5 login에 httpOnly 쿠키 설정 (accessToken, path=/, host-only)
- [ ] 14.6 login에 환경별 쿠키 속성 설정 (secure, sameSite)
- [ ] 14.7 login에 Rate limiting 적용
- [ ] 14.8 login에 GraphQL 에러 처리 추가 (extensions.code)

## 15. Module 구성 및 의존성 주입

- [ ] 15.1 AuthModule 생성
- [ ] 15.2 PassportModule, JwtModule 임포트
- [ ] 15.3 JwtStrategy Provider 등록
- [ ] 15.4 UseCases Provider 등록
- [ ] 15.5 PrismaUserRepository Provider 등록 (IUserRepository 토큰)
- [ ] 15.6 AuthResolver Provider 등록
- [ ] 15.7 AppModule에 AuthModule 임포트

## 16. Integration Tests - 회원가입

- [ ] 16.1 회원가입 성공 시나리오 테스트 (createUser Mutation E2E)
- [ ] 16.2 중복 accountId 에러 테스트
- [ ] 16.3 중복 email 에러 테스트
- [ ] 16.4 accountId 형식 위반 테스트 (3자 미만, 20자 초과, 허용되지 않은 문자)
- [ ] 16.5 email 형식 위반 테스트 (잘못된 형식, 공백 포함)
- [ ] 16.6 name 길이 위반 테스트 (빈 이름, 50자 초과)
- [ ] 16.7 비밀번호 정책 위반 테스트 (10자 미만, 72자 초과, 복잡도 부족)
- [ ] 16.8 비밀번호 해싱 확인 (저장된 값이 원본과 다름)
- [ ] 16.9 응답에 password 필드 제외 확인

## 17. Integration Tests - 로그인

- [ ] 17.1 로그인 성공 시나리오 테스트 (login Mutation E2E)
- [ ] 17.2 httpOnly 쿠키 설정 확인 (Set-Cookie 헤더)
- [ ] 17.3 쿠키 속성 확인 (name=accessToken, path=/, httpOnly, secure, sameSite)
- [ ] 17.4 응답에 accessToken 본문 제외 확인
- [ ] 17.5 존재하지 않는 accountId 에러 테스트
- [ ] 17.6 잘못된 비밀번호 에러 테스트
- [ ] 17.7 에러 메시지 동일성 확인 (계정/비밀번호 구분 불가)
- [ ] 17.8 Rate limiting 테스트 (10회 실패 시 잠금)
- [ ] 17.9 잠금 해제 후 로그인 허용 테스트
- [ ] 17.10 로그인 성공 시 카운터 초기화 테스트

## 18. Integration Tests - 인증 가드

- [ ] 18.1 보호된 Resolver에 유효한 토큰으로 접근 테스트
- [ ] 18.2 보호된 Resolver에 토큰 없이 접근 시 UNAUTHORIZED 에러 테스트
- [ ] 18.3 만료된 토큰으로 접근 시 UNAUTHORIZED 에러 테스트
- [ ] 18.4 Authorization 헤더 토큰 추출 테스트
- [ ] 18.5 쿠키 토큰 추출 테스트
- [ ] 18.6 헤더/쿠키 동시 존재 시 헤더 우선 테스트
- [ ] 18.7 @CurrentUser 데코레이터로 사용자 정보 접근 테스트
- [ ] 18.8 공개 엔드포인트(createUser, login) 인증 불필요 확인

## 19. GraphQL 에러 형식 통일

- [ ] 19.1 모든 비즈니스 에러를 HTTP 200 + errors[].extensions.code 형식으로 반환
- [ ] 19.2 에러 코드 enum 정의 (ACCOUNT_ID_ALREADY_EXISTS, INVALID_CREDENTIALS 등)
- [ ] 19.3 GlobalExceptionFilter 또는 GraphQL formatError 설정
- [ ] 19.4 각 에러 타입별 extensions.code 매핑

## 20. 테스트 커버리지 검증

- [ ] 20.1 Jest 커버리지 리포트 생성 (80%+ 확인)
- [ ] 20.2 미커버 영역 식별 및 테스트 추가
- [ ] 20.3 모든 테스트 통과 확인

## 21. 문서화

- [ ] 21.1 API 문서 업데이트 (GraphQL schema, Mutation 설명)
- [ ] 21.2 환경 변수 문서 업데이트 (JWT_SECRET, JWT_EXPIRES_IN)
- [ ] 21.3 CLAUDE.md 업데이트 (새 bounded-context, 인증 가드 사용법)
- [ ] 21.4 README.md 업데이트 (인증 시스템 섹션 추가)
