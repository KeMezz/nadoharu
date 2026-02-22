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
