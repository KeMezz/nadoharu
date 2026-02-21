import { PasswordError, PasswordErrorCode } from '../errors/password.error';

export class Password {
  private static readonly MIN_LENGTH = 10;
  private static readonly MAX_LENGTH = 72;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX =
    /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?]/;

  private readonly value: string;

  private constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  static create(value: string): Password {
    return new Password(value);
  }

  private validate(value: string): void {
    if (value.length < Password.MIN_LENGTH) {
      throw new PasswordError(
        PasswordErrorCode.PASSWORD_TOO_SHORT,
        '비밀번호는 최소 10자 이상이어야 합니다.',
      );
    }

    if (value.length > Password.MAX_LENGTH) {
      throw new PasswordError(
        PasswordErrorCode.PASSWORD_TOO_LONG,
        '비밀번호는 최대 72자 이하여야 합니다.',
      );
    }

    if (!Password.LOWERCASE_REGEX.test(value)) {
      throw new PasswordError(
        PasswordErrorCode.PASSWORD_MISSING_LOWERCASE,
        '비밀번호는 영문 소문자를 포함해야 합니다.',
      );
    }

    if (!Password.NUMBER_REGEX.test(value)) {
      throw new PasswordError(
        PasswordErrorCode.PASSWORD_MISSING_NUMBER,
        '비밀번호는 숫자를 포함해야 합니다.',
      );
    }

    if (!Password.SPECIAL_CHAR_REGEX.test(value)) {
      throw new PasswordError(
        PasswordErrorCode.PASSWORD_MISSING_SPECIAL_CHAR,
        '비밀번호는 특수문자를 포함해야 합니다.',
      );
    }
  }

  getValue(): string {
    return this.value;
  }
}
