import { UnauthorizedError } from '../../domain/errors/auth.error';
import { ExtractJwt } from 'passport-jwt';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'jwt-secret-key-with-at-least-32-characters',
      JWT_EXPIRES_IN: '15m',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('Authorization 헤더 토큰을 쿠키보다 우선 추출한다', () => {
    new JwtStrategy();
    const extractor = ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      JwtStrategy.extractTokenFromCookie,
    ]);
    const request = {
      headers: {
        authorization: 'Bearer header-token',
        cookie: 'accessToken=cookie-token',
      },
    };

    const extractedToken = extractor(request);
    expect(extractedToken).toBe('header-token');
  });

  it('헤더가 없으면 accessToken 쿠키에서 토큰을 추출한다', () => {
    new JwtStrategy();
    const extractor = ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      JwtStrategy.extractTokenFromCookie,
    ]);
    const request = {
      headers: {
        cookie: 'foo=bar; accessToken=cookie-token; baz=qux',
      },
    };

    const extractedToken = extractor(request);
    expect(extractedToken).toBe('cookie-token');
  });

  it('accessToken 쿠키가 없으면 null을 반환한다', () => {
    expect(
      JwtStrategy.extractTokenFromCookie({ headers: { cookie: 'foo=bar' } }),
    ).toBeNull();
  });

  it('cookie 헤더 자체가 없으면 null을 반환한다', () => {
    expect(JwtStrategy.extractTokenFromCookie({ headers: {} })).toBeNull();
  });

  it('validate에서 사용자 식별 정보를 반환한다', () => {
    const strategy = new JwtStrategy();
    const user = strategy.validate({
      sub: 'user-id-1',
      accountId: 'user_1',
    });

    expect(user).toEqual({
      id: 'user-id-1',
      accountId: 'user_1',
    });
  });

  it('payload가 잘못되면 UNAUTHORIZED 에러를 던진다', () => {
    const strategy = new JwtStrategy();

    expect(() =>
      strategy.validate({
        sub: 'user-id-1',
        accountId: undefined as unknown as string,
      }),
    ).toThrow(UnauthorizedError);
  });

  it('sub가 문자열이 아니면 UNAUTHORIZED 에러를 던진다', () => {
    const strategy = new JwtStrategy();

    expect(() =>
      strategy.validate({
        sub: undefined as unknown as string,
        accountId: 'user_1',
      }),
    ).toThrow(UnauthorizedError);
  });
});
