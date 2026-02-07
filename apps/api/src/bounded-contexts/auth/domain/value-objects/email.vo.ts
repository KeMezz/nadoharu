const INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT';

/**
 * Email Value Object
 * 이메일 주소를 나타내는 도메인 Value Object
 * - RFC 5322 기반 검증
 * - 자동 소문자 정규화
 * - 공백 제거
 */
export class Email {
  private readonly value: string;

  private constructor(value: string) {
    const normalized = this.normalize(value);
    this.validate(normalized);
    this.value = normalized;
  }

  static create(value: string): Email {
    return new Email(value);
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private validate(value: string): void {
    // RFC 5322 기반 이메일 정규식
    // - 로컬 파트: 공백 없는 문자 1개 이상
    // - @ 기호 정확히 1개
    // - 도메인: 공백 없는 문자 1개 이상, 점(.) 포함, TLD 필수
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value || !emailRegex.test(value)) {
      throw new Error(INVALID_EMAIL_FORMAT);
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }
}
