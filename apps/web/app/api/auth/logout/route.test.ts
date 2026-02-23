import { NextRequest } from 'next/server';
import { GET } from './route';

describe('GET /api/auth/logout', () => {
  it('로그인 페이지로 리다이렉트하고 accessToken 쿠키를 삭제한다', () => {
    const request = new NextRequest('http://localhost:3000/api/auth/logout');

    const response = GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login',
    );
    expect(response.headers.get('set-cookie')).toContain('accessToken=');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('x-forwarded-host/proto 헤더가 있어도 요청 URL origin으로 리다이렉트한다', () => {
    const request = new NextRequest('http://localhost:3000/api/auth/logout', {
      headers: {
        'x-forwarded-host': 'pi5.dab-hadar.ts.net',
        'x-forwarded-proto': 'https',
      },
    });

    const response = GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login',
    );
  });
});
