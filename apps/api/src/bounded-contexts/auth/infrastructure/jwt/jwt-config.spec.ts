import { parseDurationToMs, validateJwtConfig } from './jwt-config';

describe('jwt-config', () => {
  describe('parseDurationToMs', () => {
    it.each([
      ['15m', 900000],
      ['1h', 3600000],
      ['30s', 30000],
      ['100ms', 100],
      ['2d', 172800000],
    ])('%s를 밀리초로 변환한다', (input, expected) => {
      expect(parseDurationToMs(input)).toBe(expected);
    });

    it('단위 없는 숫자 문자열이면 에러를 던진다', () => {
      expect(() => parseDurationToMs('60')).toThrow(
        'INVALID_JWT_EXPIRES_IN_FORMAT',
      );
    });

    it('지원하지 않는 형식이면 에러를 던진다', () => {
      expect(() => parseDurationToMs('15minutes')).toThrow(
        'INVALID_JWT_EXPIRES_IN_FORMAT',
      );
    });
  });

  describe('validateJwtConfig', () => {
    it('JWT_SECRET과 JWT_EXPIRES_IN을 검증해 반환한다', () => {
      const config = validateJwtConfig({
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      expect(config.secret).toBe('a'.repeat(32));
      expect(config.expiresIn).toBe('1h');
      expect(config.expiresInMs).toBe(3600000);
    });

    it('JWT_EXPIRES_IN이 없으면 기본값 15m를 사용한다', () => {
      const config = validateJwtConfig({
        JWT_SECRET: 'a'.repeat(32),
      });

      expect(config.expiresIn).toBe('15m');
      expect(config.expiresInMs).toBe(900000);
    });

    it('JWT_EXPIRES_IN이 단위 없는 숫자 문자열이면 에러를 던진다', () => {
      expect(() =>
        validateJwtConfig({
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '60',
        }),
      ).toThrow('INVALID_JWT_EXPIRES_IN_FORMAT');
    });

    it('JWT_SECRET이 없으면 에러를 던진다', () => {
      expect(() => validateJwtConfig({ JWT_EXPIRES_IN: '15m' })).toThrow(
        'JWT_SECRET is required',
      );
    });

    it('JWT_SECRET이 32자 미만이면 에러를 던진다', () => {
      expect(() =>
        validateJwtConfig({
          JWT_SECRET: 'short-secret',
          JWT_EXPIRES_IN: '15m',
        }),
      ).toThrow('JWT_SECRET must be at least 32 characters');
    });
  });
});
