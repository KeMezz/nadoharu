import { AccountIdErrorCode } from '../../domain/errors/account-id.error';
import { AuthDomainErrorCode } from '../../domain/errors/auth.error';
import { EmailErrorCode } from '../../domain/errors/email.error';
import { NameErrorCode } from '../../domain/errors/name.error';
import { PasswordErrorCode } from '../../domain/errors/password.error';

export const AuthErrorCode = {
  ...AuthDomainErrorCode,
  ...AccountIdErrorCode,
  ...EmailErrorCode,
  ...PasswordErrorCode,
  ...NameErrorCode,
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

const AUTH_ERROR_CODES = new Set<AuthErrorCode>(Object.values(AuthErrorCode));

export function isAuthErrorCode(value: string): value is AuthErrorCode {
  return AUTH_ERROR_CODES.has(value as AuthErrorCode);
}
