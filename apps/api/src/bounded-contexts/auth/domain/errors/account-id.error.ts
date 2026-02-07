/**
 * AccountId 도메인 에러
 */
export class AccountIdError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AccountIdError';
  }
}

/**
 * AccountId 에러 코드
 */
export const AccountIdErrorCode = {
  INVALID_ACCOUNT_ID_LENGTH: 'INVALID_ACCOUNT_ID_LENGTH',
  INVALID_ACCOUNT_ID_FORMAT: 'INVALID_ACCOUNT_ID_FORMAT',
} as const;
