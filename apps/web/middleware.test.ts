import { NextRequest } from 'next/server';
import { middleware } from './middleware';

interface ForwardedOrigin {
  host: string;
  proto?: string;
}

function createRequest(
  path: string,
  hasCookie = false,
  forwardedOrigin?: ForwardedOrigin,
) {
  const url = new URL(path, 'http://localhost:3000');
  const headers = new Headers();
  if (hasCookie) {
    headers.set('cookie', 'accessToken=some-jwt-token');
  }
  if (forwardedOrigin) {
    headers.set('x-forwarded-host', forwardedOrigin.host);
    headers.set('x-forwarded-proto', forwardedOrigin.proto ?? 'https');
  }
  return new NextRequest(url, { headers });
}

describe('middleware', () => {
  describe('공개 전용 라우트 (/login, /sign-up)', () => {
    it('인증 사용자가 /login에 접근하면 /me로 리다이렉트한다', () => {
      const request = createRequest('/login', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe('/me');
    });

    it('인증 사용자가 /sign-up에 접근하면 /me로 리다이렉트한다', () => {
      const request = createRequest('/sign-up', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe('/me');
    });

    it('비인증 사용자가 /login에 접근하면 통과시킨다', () => {
      const request = createRequest('/login', false);
      const response = middleware(request);

      expect(response.headers.get('location')).toBeNull();
    });

    it('비인증 사용자가 /sign-up에 접근하면 통과시킨다', () => {
      const request = createRequest('/sign-up', false);
      const response = middleware(request);

      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('보호 라우트 (/me, /posts)', () => {
    it('비인증 사용자가 /me에 접근하면 /login으로 리다이렉트한다', () => {
      const request = createRequest('/me', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe(
        '/login',
      );
    });

    it('비인증 사용자가 /posts에 접근하면 /login으로 리다이렉트한다', () => {
      const request = createRequest('/posts', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location')!).pathname).toBe(
        '/login',
      );
    });

    it('프록시 헤더가 있어도 요청 URL origin으로 리다이렉트한다', () => {
      const request = createRequest('/me', false, {
        host: 'pi5.dab-hadar.ts.net',
        proto: 'https',
      });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/login',
      );
    });

    it('인증 사용자가 /me에 접근하면 통과시킨다', () => {
      const request = createRequest('/me', true);
      const response = middleware(request);

      expect(response.headers.get('location')).toBeNull();
    });

    it('인증 사용자가 /posts에 접근하면 통과시킨다', () => {
      const request = createRequest('/posts', true);
      const response = middleware(request);

      expect(response.headers.get('location')).toBeNull();
    });
  });
});
