import {
  AccountIdError,
  AccountIdErrorCode,
} from '../errors/account-id.error';

/**
 * 계정 ID Value Object
 *
 * 비즈니스 규칙:
 * - 길이: 3자 이상 20자 이하
 * - 허용 문자: 소문자(a-z), 숫자(0-9), 언더스코어(_)
 *
 * @example
 * const accountId = AccountId.create('user_123');
 */
export class AccountId {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 20;
  private static readonly PATTERN = /^[a-z0-9_]{3,20}$/;

  private readonly value: string;

  private constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  /**
   * AccountId 생성
   * @param value 계정 ID 문자열
   * @throws {AccountIdError} 유효하지 않은 계정 ID인 경우
   */
  static create(value: string): AccountId {
    return new AccountId(value);
  }

  private validate(value: string): void {
    // 길이 검증
    if (
      value.length < AccountId.MIN_LENGTH ||
      value.length > AccountId.MAX_LENGTH
    ) {
      throw new AccountIdError(
        AccountIdErrorCode.INVALID_ACCOUNT_ID_LENGTH,
        `계정 ID는 ${AccountId.MIN_LENGTH}자 이상 ${AccountId.MAX_LENGTH}자 이하여야 합니다.`,
      );
    }

    // 형식 검증
    if (!AccountId.PATTERN.test(value)) {
      throw new AccountIdError(
        AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
        '계정 ID는 소문자, 숫자, 언더스코어(_)만 사용할 수 있습니다.',
      );
    }
  }

  /**
   * 계정 ID 값 반환
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 다른 AccountId와 동등성 비교
   */
  equals(other: AccountId): boolean {
    return this.value === other.value;
  }
}
