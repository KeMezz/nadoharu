import { login, createUser, fetchMe } from './auth';

const GRAPHQL_URL = '/api/graphql';

describe('auth operations', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('login', () => {
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
      const body = JSON.parse(
        vi.mocked(fetch).mock.calls[0][1]!.body as string,
      );
      expect(body.variables).toEqual({
        input: { accountId: 'testuser', password: 'Password1!' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createUser', () => {
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

      const body = JSON.parse(
        vi.mocked(fetch).mock.calls[0][1]!.body as string,
      );
      expect(body.variables).toEqual({ input });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('fetchMe', () => {
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
});
