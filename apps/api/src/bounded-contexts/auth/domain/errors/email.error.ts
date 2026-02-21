export const EmailErrorCode = {
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
} as const;

export type EmailErrorCodeValue =
  (typeof EmailErrorCode)[keyof typeof EmailErrorCode];

export class EmailError extends Error {
  constructor(
    public readonly code: EmailErrorCodeValue,
    message: string,
  ) {
    super(message);
    this.name = 'EmailError';
  }
}
