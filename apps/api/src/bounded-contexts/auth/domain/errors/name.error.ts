export const NameErrorCode = {
  NAME_REQUIRED: 'NAME_REQUIRED',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
} as const;

export type NameErrorCodeValue =
  (typeof NameErrorCode)[keyof typeof NameErrorCode];

export class NameError extends Error {
  constructor(
    public readonly code: NameErrorCodeValue,
    message: string,
  ) {
    super(message);
    this.name = 'NameError';
  }
}
