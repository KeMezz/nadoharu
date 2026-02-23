import { login } from './login.mutation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const GRAPHQL_URL = '/api/graphql';

describe('login mutation', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('accountId와 password로 login mutation을 전송한다', async () => {
    const mockResponse = {
      data: {
        login: {
          user: {
            id: '1',
            accountId: 'testuser',
            email: 'test@example.com',
            name: 'Test',
          },
        },
      },
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await login({
      accountId: 'testuser',
      password: 'Password1!',
    });

    expect(fetch).toHaveBeenCalledWith(
      GRAPHQL_URL,
      expect.objectContaining({
        credentials: 'include',
      }),
    );
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.variables).toEqual({
      input: { accountId: 'testuser', password: 'Password1!' },
    });
    expect(result).toEqual(mockResponse);
  });
});
