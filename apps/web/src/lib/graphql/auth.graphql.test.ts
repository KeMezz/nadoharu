import { createUser, fetchMe, login } from './auth';

const mockGraphqlClient = vi.fn();

vi.mock('./client', () => ({
  graphqlClient: (...args: unknown[]) => mockGraphqlClient(...args),
}));

vi.mock('./auth.graphql', () => ({
  default: `
# -- LOGIN_MUTATION --
mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
    }
  }
}

# -- CREATE_USER_MUTATION --
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
  }
}

# -- ME_QUERY --
query Me {
  me {
    id
  }
}
`,
}));

describe('auth graphql document', () => {
  beforeEach(() => {
    mockGraphqlClient.mockReset();
    mockGraphqlClient.mockResolvedValue({ data: {} });
  });

  it('login은 auth.graphql의 LOGIN_MUTATION 문서를 사용한다', async () => {
    await login({ accountId: 'testuser', password: 'Password1!' });

    expect(mockGraphqlClient).toHaveBeenCalledWith(
      `mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
    }
  }
}`,
      {
        input: {
          accountId: 'testuser',
          password: 'Password1!',
        },
      },
    );
  });

  it('createUser는 auth.graphql의 CREATE_USER_MUTATION 문서를 사용한다', async () => {
    await createUser({
      accountId: 'newuser',
      password: 'Password1!',
      email: 'new@example.com',
      name: 'new',
    });

    expect(mockGraphqlClient).toHaveBeenCalledWith(
      `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
  }
}`,
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

  it('fetchMe는 auth.graphql의 ME_QUERY 문서를 사용한다', async () => {
    await fetchMe();

    expect(mockGraphqlClient).toHaveBeenCalledWith(`query Me {
  me {
    id
  }
}`);
  });
});
