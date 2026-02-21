# Nadoharu API

NestJS + GraphQL 기반 API 서버입니다.

## GraphQL Endpoint

- URL: `http://localhost:3001/graphql`

## Authentication API

### `createUser` Mutation

신규 사용자를 생성합니다.

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    accountId
    email
    name
    createdAt
  }
}
```

```json
{
  "input": {
    "accountId": "user_123",
    "password": "password1!a",
    "email": "user@example.com",
    "name": "테스트유저"
  }
}
```

### `login` Mutation

계정 인증 후 사용자 정보를 반환하고, `accessToken`을 `httpOnly` 쿠키로 설정합니다.

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
      accountId
      email
      name
    }
  }
}
```

```json
{
  "input": {
    "accountId": "user_123",
    "password": "password1!a"
  }
}
```

### `me` Query (보호된 Resolver)

현재 인증된 사용자 정보를 조회합니다.

```graphql
query Me {
  me {
    id
    accountId
    email
    name
  }
}
```

인증 토큰 추출 우선순위:

1. `Authorization: Bearer <token>`
2. `Cookie: accessToken=<token>`

## GraphQL Error Format

비즈니스 에러는 HTTP 200으로 반환되며, `errors[].extensions.code`에 에러 코드가 포함됩니다.

주요 에러 코드:

- `ACCOUNT_ID_ALREADY_EXISTS`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `ACCOUNT_TEMPORARILY_LOCKED`
- `UNAUTHORIZED`
- `INVALID_ACCOUNT_ID_LENGTH`
- `INVALID_ACCOUNT_ID_FORMAT`
- `INVALID_EMAIL_FORMAT`
- `NAME_REQUIRED`
- `NAME_TOO_LONG`
- `PASSWORD_TOO_SHORT`
- `PASSWORD_TOO_LONG`
- `PASSWORD_MISSING_LOWERCASE`
- `PASSWORD_MISSING_NUMBER`
- `PASSWORD_MISSING_SPECIAL_CHAR`

## Environment Variables

- `JWT_SECRET`: JWT 서명 키 (최소 32자)
- `JWT_EXPIRES_IN`: 토큰 만료 시간 (`15m` 기본)

## Test Commands

- Unit + coverage: `pnpm --filter api test:cov`
- Integration: `pnpm --filter api test:integration`
