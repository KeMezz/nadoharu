import { fetchMe } from './me.query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const GRAPHQL_URL = '/api/graphql';

describe('me query', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('me query를 credentials: include로 전송한다', async () => {
    const mockResponse = {
      data: {
        me: {
          id: '1',
          accountId: 'testuser',
          email: 'test@example.com',
          name: 'Test',
        },
      },
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await fetchMe();

    expect(fetch).toHaveBeenCalledWith(
      GRAPHQL_URL,
      expect.objectContaining({
        credentials: 'include',
      }),
    );
    expect(result).toEqual(mockResponse);
  });
});
