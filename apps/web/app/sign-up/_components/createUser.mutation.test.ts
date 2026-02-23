import { createUser } from './createUser.mutation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('createUser mutation', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('4개 필드로 createUser mutation을 전송한다', async () => {
    const mockResponse = {
      data: {
        createUser: {
          id: '1',
          accountId: 'newuser',
          email: 'new@example.com',
          name: 'New',
        },
      },
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const input = {
      accountId: 'newuser',
      password: 'Password1!',
      email: 'new@example.com',
      name: 'New',
    };
    const result = await createUser(input);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.variables).toEqual({ input });
    expect(result).toEqual(mockResponse);
  });
});
