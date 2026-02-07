export class Password {
  private static readonly MIN_LENGTH = 10;
  private static readonly MAX_LENGTH = 72;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>\/?]/;

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
      throw new Error('PASSWORD_TOO_SHORT');
    }

    if (value.length > Password.MAX_LENGTH) {
      throw new Error('PASSWORD_TOO_LONG');
    }

    if (!Password.LOWERCASE_REGEX.test(value)) {
      throw new Error('PASSWORD_MISSING_LOWERCASE');
    }

    if (!Password.NUMBER_REGEX.test(value)) {
      throw new Error('PASSWORD_MISSING_NUMBER');
    }

    if (!Password.SPECIAL_CHAR_REGEX.test(value)) {
      throw new Error('PASSWORD_MISSING_SPECIAL_CHAR');
    }
  }

  getValue(): string {
    return this.value;
  }
}
