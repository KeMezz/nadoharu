/**
 * 인증 도메인 에러 클래스
 *
 * DDD 원칙:
 * - Domain Layer의 에러 정의
 * - 타입 안정성 제공 (에러 타입으로 분기 가능)
 * - Infrastructure Layer에서 HTTP 상태 코드 매핑 용이
 */

/**
 * AccountId가 이미 존재하는 경우
 */
export class AccountIdAlreadyExistsError extends Error {
  constructor() {
    super('ACCOUNT_ID_ALREADY_EXISTS');
    this.name = 'AccountIdAlreadyExistsError';
  }
}

/**
 * Email이 이미 존재하는 경우
 */
export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('EMAIL_ALREADY_EXISTS');
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * 인증 실패 (계정 없음 또는 비밀번호 불일치)
 * 보안: 계정 존재 여부를 노출하지 않기 위해 동일한 에러 사용
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}
