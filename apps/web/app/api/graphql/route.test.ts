import { NextRequest } from 'next/server';
import { POST } from './route';

const DEFAULT_UPSTREAM_URL = 'http://localhost:3001/graphql';

describe('POST /api/graphql', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    process.env = { ...originalEnv };
    delete process.env.GRAPHQL_UPSTREAM_URL;
    delete process.env.NEXT_PUBLIC_GRAPHQL_URL;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('요청 본문과 인증 쿠키를 upstream GraphQL로 전달한다', async () => {
    const upstreamPayload = { data: { me: { id: '1' } } };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(upstreamPayload), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'set-cookie': 'accessToken=new-token; Path=/; HttpOnly',
        },
      }),
    );

    const body = JSON.stringify({ query: 'query Me { me { id } }' });
    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'accessToken=old-token',
      },
      body,
    });

    const response = await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      DEFAULT_UPSTREAM_URL,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: 'accessToken=old-token',
        },
        body,
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain(
      'accessToken=new-token',
    );
    await expect(response.json()).resolves.toEqual(upstreamPayload);
  });

  it('x-forwarded-for 헤더를 클라이언트 입력 그대로 upstream에 전달하지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.10',
      },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      DEFAULT_UPSTREAM_URL,
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'x-forwarded-for': '203.0.113.10',
        }),
      }),
    );
  });

  it('플랫폼 제공 원본 IP 헤더를 upstream으로 전달한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-vercel-forwarded-for': '198.51.100.42, 198.51.100.43',
        'x-forwarded-for': '203.0.113.10',
      },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      DEFAULT_UPSTREAM_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-forwarded-for': '198.51.100.42',
          'x-real-ip': '198.51.100.42',
        }),
      }),
    );
  });

  it('request.ip가 있으면 플랫폼 헤더보다 우선해 upstream으로 전달한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-vercel-forwarded-for': '198.51.100.42',
      },
      body: JSON.stringify({ query: '{ __typename }' }),
    });
    Object.defineProperty(request, 'ip', {
      value: '192.0.2.24',
      configurable: true,
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      DEFAULT_UPSTREAM_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-forwarded-for': '192.0.2.24',
          'x-real-ip': '192.0.2.24',
        }),
      }),
    );
  });

  it('NEXT_PUBLIC_GRAPHQL_URL이 있어도 서버 프록시는 기본 upstream 주소를 사용한다', async () => {
    process.env.NEXT_PUBLIC_GRAPHQL_URL = 'https://public.example.com/graphql';
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      DEFAULT_UPSTREAM_URL,
      expect.any(Object),
    );
  });

  it('upstream의 다중 set-cookie를 모두 클라이언트로 전달한다', async () => {
    const upstreamHeaders = new Headers({
      'content-type': 'application/json',
    });
    upstreamHeaders.append(
      'set-cookie',
      'accessToken=new-token; Path=/; HttpOnly',
    );
    upstreamHeaders.append(
      'set-cookie',
      'refreshToken=new-refresh-token; Path=/; HttpOnly',
    );

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: upstreamHeaders,
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    const response = await POST(request);
    const setCookieHeader = response.headers.get('set-cookie');

    expect(setCookieHeader).toContain('accessToken=new-token');
    expect(setCookieHeader).toContain('refreshToken=new-refresh-token');
  });

  it('GRAPHQL_UPSTREAM_URL 환경 변수가 있으면 해당 주소를 사용한다', async () => {
    process.env.GRAPHQL_UPSTREAM_URL = 'http://127.0.0.1:4001/graphql';
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    await POST(request);

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:4001/graphql',
      expect.any(Object),
    );
  });

  it('upstream 호출 실패 시 NETWORK_ERROR를 반환한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('connect ECONNREFUSED'));

    const request = new NextRequest('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      errors: [
        {
          message: 'NETWORK_ERROR',
          extensions: {
            code: 'NETWORK_ERROR',
          },
        },
      ],
    });
  });
});
