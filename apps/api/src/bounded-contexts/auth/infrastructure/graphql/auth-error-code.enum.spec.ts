import { AccountIdErrorCode } from '../../domain/errors/account-id.error';
import { AuthDomainErrorCode } from '../../domain/errors/auth.error';
import { EmailErrorCode } from '../../domain/errors/email.error';
import { NameErrorCode } from '../../domain/errors/name.error';
import { PasswordErrorCode } from '../../domain/errors/password.error';
import { AuthErrorCode, isAuthErrorCode } from './auth-error-code.enum';

describe('AuthErrorCode', () => {
  it('도메인 에러 코드 집합을 단일 원천으로 사용한다', () => {
    expect(AuthErrorCode.ACCOUNT_ID_ALREADY_EXISTS).toBe(
      AuthDomainErrorCode.ACCOUNT_ID_ALREADY_EXISTS,
    );
    expect(AuthErrorCode.INVALID_ACCOUNT_ID_FORMAT).toBe(
      AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
    );
    expect(AuthErrorCode.INVALID_EMAIL_FORMAT).toBe(
      EmailErrorCode.INVALID_EMAIL_FORMAT,
    );
    expect(AuthErrorCode.PASSWORD_TOO_SHORT).toBe(
      PasswordErrorCode.PASSWORD_TOO_SHORT,
    );
    expect(AuthErrorCode.NAME_REQUIRED).toBe(NameErrorCode.NAME_REQUIRED);
  });

  it('도메인 에러 코드를 모두 AuthErrorCode로 인정한다', () => {
    Object.values(AuthDomainErrorCode).forEach((code) => {
      expect(isAuthErrorCode(code)).toBe(true);
    });
    Object.values(AccountIdErrorCode).forEach((code) => {
      expect(isAuthErrorCode(code)).toBe(true);
    });
    Object.values(EmailErrorCode).forEach((code) => {
      expect(isAuthErrorCode(code)).toBe(true);
    });
    Object.values(PasswordErrorCode).forEach((code) => {
      expect(isAuthErrorCode(code)).toBe(true);
    });
    Object.values(NameErrorCode).forEach((code) => {
      expect(isAuthErrorCode(code)).toBe(true);
    });
  });
});
