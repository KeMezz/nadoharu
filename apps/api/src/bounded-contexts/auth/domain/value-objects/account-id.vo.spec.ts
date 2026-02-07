import { AccountId } from './account-id.vo';
import { AccountIdErrorCode } from '../errors/account-id.error';

describe('AccountId', () => {
  describe('유효한 accountId 생성', () => {
    it('소문자, 숫자, 언더스코어만 포함된 accountId를 생성할 수 있다', () => {
      const accountId = AccountId.create('user_123');
      expect(accountId.getValue()).toBe('user_123');
    });

    it('3자 accountId를 생성할 수 있다 (최소 경계값)', () => {
      const accountId = AccountId.create('abc');
      expect(accountId.getValue()).toBe('abc');
    });

    it('20자 accountId를 생성할 수 있다 (최대 경계값)', () => {
      const accountId = AccountId.create('12345678901234567890');
      expect(accountId.getValue()).toBe('12345678901234567890');
    });

    it('숫자만 포함된 accountId를 생성할 수 있다', () => {
      const accountId = AccountId.create('123456');
      expect(accountId.getValue()).toBe('123456');
    });

    it('언더스코어가 포함된 accountId를 생성할 수 있다', () => {
      const accountId = AccountId.create('user_name_123');
      expect(accountId.getValue()).toBe('user_name_123');
    });
  });

  describe('무효한 accountId 검증', () => {
    it('2자 이하 accountId는 INVALID_ACCOUNT_ID_LENGTH 에러를 발생시킨다', () => {
      expect(() => AccountId.create('ab')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_LENGTH,
        }),
      );
    });

    it('21자 이상 accountId는 INVALID_ACCOUNT_ID_LENGTH 에러를 발생시킨다', () => {
      expect(() => AccountId.create('123456789012345678901')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_LENGTH,
        }),
      );
    });

    it('대문자가 포함된 accountId는 INVALID_ACCOUNT_ID_FORMAT 에러를 발생시킨다', () => {
      expect(() => AccountId.create('User123')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
        }),
      );
    });

    it('특수문자(언더스코어 제외)가 포함된 accountId는 INVALID_ACCOUNT_ID_FORMAT 에러를 발생시킨다', () => {
      expect(() => AccountId.create('user-123')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
        }),
      );
    });

    it('공백이 포함된 accountId는 INVALID_ACCOUNT_ID_FORMAT 에러를 발생시킨다', () => {
      expect(() => AccountId.create('user 123')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
        }),
      );
    });

    it('빈 문자열은 INVALID_ACCOUNT_ID_LENGTH 에러를 발생시킨다', () => {
      expect(() => AccountId.create('')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_LENGTH,
        }),
      );
    });

    it('한글이 포함된 accountId는 INVALID_ACCOUNT_ID_FORMAT 에러를 발생시킨다', () => {
      expect(() => AccountId.create('사용자123')).toThrow(
        expect.objectContaining({
          code: AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
        }),
      );
    });
  });

  describe('equals 메서드', () => {
    it('같은 값을 가진 AccountId는 동등하다', () => {
      const accountId1 = AccountId.create('user_123');
      const accountId2 = AccountId.create('user_123');
      expect(accountId1.equals(accountId2)).toBe(true);
    });

    it('다른 값을 가진 AccountId는 동등하지 않다', () => {
      const accountId1 = AccountId.create('user_123');
      const accountId2 = AccountId.create('user_456');
      expect(accountId1.equals(accountId2)).toBe(false);
    });
  });
});
