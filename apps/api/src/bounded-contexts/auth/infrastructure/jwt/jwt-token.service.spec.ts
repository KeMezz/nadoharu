import { JwtService } from '@nestjs/jwt';
import { UnauthorizedError } from '../../domain/errors/auth.error';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  const secret = 'jwt-secret-key-with-at-least-32-characters';
  let jwtService: JwtService;
  let service: JwtTokenService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret,
      signOptions: {
        algorithm: 'HS256',
        expiresIn: '15m',
      },
    });
    service = new JwtTokenService(jwtService);
  });

  it('HS256으로 토큰을 발급하고 검증한다', () => {
    const token = service.sign({
      sub: 'user-id-1',
      accountId: 'user_1',
    });

    const payload = service.verify(token);

    expect(payload.sub).toBe('user-id-1');
    expect(payload.accountId).toBe('user_1');
    expect(typeof payload.iat).toBe('number');
    expect(typeof payload.exp).toBe('number');
  });

  it('만료된 토큰을 거부한다', () => {
    const expiredToken = jwtService.sign(
      {
        sub: 'user-id-1',
        accountId: 'user_1',
      },
      {
        algorithm: 'HS256',
        expiresIn: '-10s',
      },
    );

    expect(() => service.verify(expiredToken)).toThrow(UnauthorizedError);
  });

  it('none 알고리즘 토큰을 거부한다', () => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'none', typ: 'JWT' }),
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: 'user-id-1', accountId: 'user_1' }),
    ).toString('base64url');
    const unsignedToken = `${header}.${payload}.`;

    expect(() => service.verify(unsignedToken)).toThrow(UnauthorizedError);
  });

  it('HS256이 아닌 토큰을 거부한다', () => {
    const hs512Token = jwtService.sign(
      {
        sub: 'user-id-1',
        accountId: 'user_1',
      },
      {
        algorithm: 'HS512',
      },
    );

    expect(() => service.verify(hs512Token)).toThrow(UnauthorizedError);
  });

  it('sub가 문자열이 아니면 거부한다', () => {
    const token = jwtService.sign({
      sub: 123,
      accountId: 'user_1',
    });

    expect(() => service.verify(token)).toThrow(UnauthorizedError);
  });

  it('accountId가 문자열이 아니면 거부한다', () => {
    const token = jwtService.sign({
      sub: 'user-id-1',
      accountId: 123,
    });

    expect(() => service.verify(token)).toThrow(UnauthorizedError);
  });
});
