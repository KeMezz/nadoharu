import { graphqlClient } from './client';

const GRAPHQL_URL = '/api/graphql';

describe('graphqlClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('올바른 URL과 헤더로 POST 요청을 전송한다', async () => {
    const mockResponse = { data: { me: { id: '1' } } };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    await graphqlClient('query Me { me { id } }');

    expect(fetch).toHaveBeenCalledWith(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query: 'query Me { me { id } }' }),
    });
  });

  it('variables가 있으면 body에 포함한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );

    await graphqlClient(
      'mutation Login($input: LoginInput!) { login(input: $input) { user { id } } }',
      {
        input: { accountId: 'test', password: 'pass' },
      },
    );

    expect(fetch).toHaveBeenCalledWith(
      GRAPHQL_URL,
      expect.objectContaining({
        body: JSON.stringify({
          query:
            'mutation Login($input: LoginInput!) { login(input: $input) { user { id } } }',
          variables: { input: { accountId: 'test', password: 'pass' } },
        }),
      }),
    );
  });

  it('credentials: include를 항상 포함한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );

    await graphqlClient('query { me { id } }');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('응답 JSON을 파싱하여 반환한다', async () => {
    const mockData = { data: { me: { id: '1', accountId: 'test' } } };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 }),
    );

    const result = await graphqlClient('query { me { id accountId } }');

    expect(result).toEqual(mockData);
  });

  it('비정상 HTTP에서 JSON이 아닌 응답이면 NETWORK_ERROR를 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        '<!doctype html><html><body>Service Unavailable</body></html>',
        {
          status: 503,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        },
      ),
    );

    const result = await graphqlClient('query { me { id } }');

    expect(result).toEqual({
      errors: [
        {
          message: 'NETWORK_ERROR',
          extensions: { code: 'NETWORK_ERROR' },
        },
      ],
    });
  });

  it('네트워크 오류 시 예외를 전파한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    await expect(graphqlClient('query { me { id } }')).rejects.toThrow(
      'Network error',
    );
  });
});
