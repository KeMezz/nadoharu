export const PasswordErrorCode = {
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  PASSWORD_MISSING_LOWERCASE: 'PASSWORD_MISSING_LOWERCASE',
  PASSWORD_MISSING_NUMBER: 'PASSWORD_MISSING_NUMBER',
  PASSWORD_MISSING_SPECIAL_CHAR: 'PASSWORD_MISSING_SPECIAL_CHAR',
} as const;

export type PasswordErrorCodeValue =
  (typeof PasswordErrorCode)[keyof typeof PasswordErrorCode];

export class PasswordError extends Error {
  constructor(
    public readonly code: PasswordErrorCodeValue,
    message: string,
  ) {
    super(message);
    this.name = 'PasswordError';
  }
}
