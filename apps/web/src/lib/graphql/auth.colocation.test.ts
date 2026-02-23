import { createUser, fetchMe, login } from './auth';

const mockGraphqlClient = vi.fn();

vi.mock('./client', () => ({
  graphqlClient: (...args: unknown[]) => mockGraphqlClient(...args),
}));

vi.mock('./auth.operations', () => ({
  LOGIN_MUTATION: 'LOGIN_MUTATION_DOCUMENT',
  CREATE_USER_MUTATION: 'CREATE_USER_MUTATION_DOCUMENT',
  ME_QUERY: 'ME_QUERY_DOCUMENT',
}));

describe('auth colocation', () => {
  beforeEach(() => {
    mockGraphqlClient.mockReset();
    mockGraphqlClient.mockResolvedValue({ data: {} });
  });

  it('login은 분리된 LOGIN_MUTATION 문서를 사용한다', async () => {
    await login({ accountId: 'testuser', password: 'Password1!' });

    expect(mockGraphqlClient).toHaveBeenCalledWith('LOGIN_MUTATION_DOCUMENT', {
      input: {
        accountId: 'testuser',
        password: 'Password1!',
      },
    });
  });

  it('createUser는 분리된 CREATE_USER_MUTATION 문서를 사용한다', async () => {
    await createUser({
      accountId: 'newuser',
      password: 'Password1!',
      email: 'new@example.com',
      name: 'new',
    });

    expect(mockGraphqlClient).toHaveBeenCalledWith(
      'CREATE_USER_MUTATION_DOCUMENT',
      {
        input: {
          accountId: 'newuser',
          password: 'Password1!',
          email: 'new@example.com',
          name: 'new',
        },
      },
    );
  });

  it('fetchMe는 분리된 ME_QUERY 문서를 사용한다', async () => {
    await fetchMe();

    expect(mockGraphqlClient).toHaveBeenCalledWith('ME_QUERY_DOCUMENT');
  });
});
