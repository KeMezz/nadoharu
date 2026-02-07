const INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT';

/**
 * Email Value Object
 * 이메일 주소를 나타내는 도메인 Value Object
 * - 기본 이메일 형식 검증 (@ 기호, 도메인, TLD 필수)
 * - 자동 소문자 정규화
 * - 공백 제거
 *
 * Note: 엄격한 RFC 5322 검증은 Infrastructure Layer에서 처리
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
    // 기본 이메일 형식 검증
    // - 로컬 파트: 공백 없는 문자 1개 이상
    // - @ 기호 정확히 1개
    // - 도메인: 공백 없는 문자 1개 이상, 점(.) 포함, TLD 필수
    //
    // Note: 연속된 점(.), 시작/끝 점 등 엣지 케이스는
    //       Infrastructure Layer(DTO validation, 메일 발송)에서 최종 검증
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
