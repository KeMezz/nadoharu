/**
 * 인증 도메인 에러 클래스
 *
 * DDD 원칙:
 * - Domain Layer의 에러 정의
 * - 타입 안정성 제공 (에러 타입으로 분기 가능)
 * - Infrastructure Layer에서 HTTP 상태 코드 매핑 용이
 */

export const AuthDomainErrorCode = {
  ACCOUNT_ID_ALREADY_EXISTS: 'ACCOUNT_ID_ALREADY_EXISTS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_TEMPORARILY_LOCKED: 'ACCOUNT_TEMPORARILY_LOCKED',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type AuthDomainErrorCodeValue =
  (typeof AuthDomainErrorCode)[keyof typeof AuthDomainErrorCode];

/**
 * AccountId가 이미 존재하는 경우
 */
export class AccountIdAlreadyExistsError extends Error {
  readonly code = AuthDomainErrorCode.ACCOUNT_ID_ALREADY_EXISTS;

  constructor() {
    super(AuthDomainErrorCode.ACCOUNT_ID_ALREADY_EXISTS);
    this.name = 'AccountIdAlreadyExistsError';
  }
}

/**
 * Email이 이미 존재하는 경우
 */
export class EmailAlreadyExistsError extends Error {
  readonly code = AuthDomainErrorCode.EMAIL_ALREADY_EXISTS;

  constructor() {
    super(AuthDomainErrorCode.EMAIL_ALREADY_EXISTS);
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * 인증 실패 (계정 없음 또는 비밀번호 불일치)
 * 보안: 계정 존재 여부를 노출하지 않기 위해 동일한 에러 사용
 */
export class InvalidCredentialsError extends Error {
  readonly code = AuthDomainErrorCode.INVALID_CREDENTIALS;

  constructor() {
    super(AuthDomainErrorCode.INVALID_CREDENTIALS);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * 로그인 시도 제한 초과
 */
export class AccountTemporarilyLockedError extends Error {
  readonly code = AuthDomainErrorCode.ACCOUNT_TEMPORARILY_LOCKED;

  constructor() {
    super(AuthDomainErrorCode.ACCOUNT_TEMPORARILY_LOCKED);
    this.name = 'AccountTemporarilyLockedError';
  }
}

/**
 * 인증 실패
 */
export class UnauthorizedError extends Error {
  readonly code = AuthDomainErrorCode.UNAUTHORIZED;

  constructor() {
    super(AuthDomainErrorCode.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}
