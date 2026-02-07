import { Password } from './password.vo';

describe('Password Value Object', () => {
  describe('유효한 비밀번호', () => {
    it('기본 조건을 만족하는 비밀번호를 생성한다', () => {
      expect(() => Password.create('MyP@ssw0rd')).not.toThrow();
    });

    it('최소 길이(10자) + 소문자 + 숫자 + 특수문자를 포함하는 비밀번호를 생성한다', () => {
      expect(() => Password.create('a1!bcdefgh')).not.toThrow();
    });

    it('최대 길이(72자) 특수문자 포함 비밀번호를 생성한다', () => {
      const longPassword = 'a'.repeat(69) + '1!@';
      expect(() => Password.create(longPassword)).not.toThrow();
    });

    it('getValue()로 비밀번호 값을 반환한다', () => {
      const password = Password.create('MyP@ssw0rd');
      expect(password.getValue()).toBe('MyP@ssw0rd');
    });
  });

  describe('최소 길이 검증', () => {
    it('9자 비밀번호는 PASSWORD_TOO_SHORT 에러를 던진다', () => {
      expect(() => Password.create('aB1!cdefg')).toThrow('PASSWORD_TOO_SHORT');
    });

    it('1자 비밀번호는 PASSWORD_TOO_SHORT 에러를 던진다', () => {
      expect(() => Password.create('a')).toThrow('PASSWORD_TOO_SHORT');
    });

    it('빈 문자열은 PASSWORD_TOO_SHORT 에러를 던진다', () => {
      expect(() => Password.create('')).toThrow('PASSWORD_TOO_SHORT');
    });
  });

  describe('최대 길이 검증', () => {
    it('73자 비밀번호는 PASSWORD_TOO_LONG 에러를 던진다', () => {
      const tooLongPassword = 'a'.repeat(70) + '1!@';
      expect(() => Password.create(tooLongPassword)).toThrow('PASSWORD_TOO_LONG');
    });

    it('100자 비밀번호는 PASSWORD_TOO_LONG 에러를 던진다', () => {
      const tooLongPassword = 'a'.repeat(97) + '1!@';
      expect(() => Password.create(tooLongPassword)).toThrow('PASSWORD_TOO_LONG');
    });
  });

  describe('소문자 검증', () => {
    it('소문자가 없으면 PASSWORD_MISSING_LOWERCASE 에러를 던진다', () => {
      expect(() => Password.create('AAAA1!BBBB')).toThrow('PASSWORD_MISSING_LOWERCASE');
    });

    it('대문자+숫자+특수문자만 있으면 PASSWORD_MISSING_LOWERCASE 에러를 던진다', () => {
      expect(() => Password.create('ABC123!@#$')).toThrow('PASSWORD_MISSING_LOWERCASE');
    });
  });

  describe('숫자 검증', () => {
    it('숫자가 없으면 PASSWORD_MISSING_NUMBER 에러를 던진다', () => {
      expect(() => Password.create('aaaa!bbbbb')).toThrow('PASSWORD_MISSING_NUMBER');
    });

    it('소문자+특수문자만 있으면 PASSWORD_MISSING_NUMBER 에러를 던진다', () => {
      expect(() => Password.create('abcd!@#$ef')).toThrow('PASSWORD_MISSING_NUMBER');
    });
  });

  describe('특수문자 검증', () => {
    it('특수문자가 없으면 PASSWORD_MISSING_SPECIAL_CHAR 에러를 던진다', () => {
      expect(() => Password.create('aaaa1bbbbb')).toThrow('PASSWORD_MISSING_SPECIAL_CHAR');
    });

    it('소문자+숫자만 있으면 PASSWORD_MISSING_SPECIAL_CHAR 에러를 던진다', () => {
      expect(() => Password.create('abcd123456')).toThrow('PASSWORD_MISSING_SPECIAL_CHAR');
    });
  });

  describe('다중 위반 시 첫 번째 에러만 반환', () => {
    it('9자 + 소문자 없음 → PASSWORD_TOO_SHORT만 반환', () => {
      expect(() => Password.create('AAA1!BBBB')).toThrow('PASSWORD_TOO_SHORT');
    });

    it('73자 + 소문자 없음 → PASSWORD_TOO_LONG만 반환', () => {
      const tooLong = 'A'.repeat(70) + '1!@';
      expect(() => Password.create(tooLong)).toThrow('PASSWORD_TOO_LONG');
    });

    it('10자 + 소문자 없음 + 숫자 없음 → PASSWORD_MISSING_LOWERCASE만 반환', () => {
      expect(() => Password.create('AAAA!BBBBB')).toThrow('PASSWORD_MISSING_LOWERCASE');
    });

    it('10자 + 숫자 없음 + 특수문자 없음 → PASSWORD_MISSING_NUMBER만 반환', () => {
      expect(() => Password.create('aaaabbbbbb')).toThrow('PASSWORD_MISSING_NUMBER');
    });
  });

  describe('모든 특수문자 지원 검증', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>/?';

    specialChars.split('').forEach((char) => {
      it(`특수문자 "${char}"를 포함한 비밀번호를 생성한다`, () => {
        const password = `abc123${char}def`;
        expect(() => Password.create(password)).not.toThrow();
      });
    });
  });
});
