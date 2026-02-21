import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '.prisma/client';
import { AppModule } from '../../../../../app.module';

interface GraphQLErrorItem {
  message: string;
  extensions?: {
    code?: string;
  };
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLErrorItem[];
}

interface CreateUserPayload {
  createUser: {
    id: string;
    accountId: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

interface LoginPayload {
  login: {
    user: {
      id: string;
      accountId: string;
      email: string;
      name: string;
    };
  };
}

interface MePayload {
  me: {
    id: string;
    accountId: string;
    email: string;
    name: string;
  };
}

const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      accountId
      email
      name
      createdAt
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        accountId
        email
        name
      }
    }
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      accountId
      email
      name
    }
  }
`;

describe('AuthResolver (Integration)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prisma: PrismaClient;
  let graphqlUrl: string;
  let sequence = 0;

  const originalEnv = process.env;

  beforeAll(async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET:
        originalEnv.JWT_SECRET ?? 'jwt-secret-key-with-at-least-32-characters',
      JWT_EXPIRES_IN: originalEnv.JWT_EXPIRES_IN ?? '15m',
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
    if (!address || typeof address === 'string') {
      throw new Error('HTTP server address is not available');
    }

    graphqlUrl = `http://127.0.0.1:${address.port}/graphql`;
    prisma = module.get<PrismaClient>('PrismaClient');
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
    process.env = originalEnv;
  });

  async function executeGraphql<TData>(params: {
    query: string;
    variables?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<{
    status: number;
    body: GraphQLResponse<TData>;
    setCookie: string | null;
  }> {
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(params.headers ?? {}),
      },
      body: JSON.stringify({
        query: params.query,
        variables: params.variables,
      }),
    });

    const body = (await response.json()) as GraphQLResponse<TData>;
    return {
      status: response.status,
      body,
      setCookie: response.headers.get('set-cookie'),
    };
  }

  function createUserInput(
    overrides?: Partial<{
      accountId: string;
      email: string;
      name: string;
      password: string;
    }>,
  ) {
    sequence += 1;
    return {
      accountId: `user_${sequence}`,
      email: `user_${sequence}@example.com`,
      name: `테스트유저${sequence}`,
      password: 'password1!a',
      ...overrides,
    };
  }

  function expectGraphqlError(
    body: GraphQLResponse<unknown>,
    code: string,
  ): GraphQLErrorItem {
    expect(body.data).toBeNull();
    expect(body.errors).toBeDefined();
    const firstError = body.errors?.[0];
    expect(firstError).toBeDefined();
    expect(firstError?.extensions?.code).toBe(code);
    return firstError as GraphQLErrorItem;
  }

  function extractAccessToken(setCookie: string | null): string {
    if (!setCookie) {
      throw new Error('Set-Cookie header is missing');
    }

    const match = /accessToken=([^;]+)/.exec(setCookie);
    if (!match) {
      throw new Error('accessToken cookie is missing');
    }

    return match[1];
  }

  describe('16. Integration Tests - 회원가입', () => {
    it('16.1 회원가입 성공 시 User를 반환한다', async () => {
      const input = createUserInput();
      const result = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      expect(result.status).toBe(200);
      expect(result.body.errors).toBeUndefined();
      expect(result.body.data?.createUser).toMatchObject({
        accountId: input.accountId,
        email: input.email,
        name: input.name,
      });
      expect(result.body.data?.createUser.id).toBeTruthy();
      expect(result.body.data?.createUser.createdAt).toBeTruthy();
    });

    it('16.2 중복 accountId는 ACCOUNT_ID_ALREADY_EXISTS 에러를 반환한다', async () => {
      const input = createUserInput();

      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const duplicateResult = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: {
          input: createUserInput({
            accountId: input.accountId,
            email: `other-${input.email}`,
          }),
        },
      });

      expect(duplicateResult.status).toBe(200);
      expectGraphqlError(duplicateResult.body, 'ACCOUNT_ID_ALREADY_EXISTS');
    });

    it('16.3 중복 email은 EMAIL_ALREADY_EXISTS 에러를 반환한다', async () => {
      const input = createUserInput();

      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const duplicateResult = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: {
          input: createUserInput({
            accountId: `${input.accountId}_2`,
            email: input.email,
          }),
        },
      });

      expect(duplicateResult.status).toBe(200);
      expectGraphqlError(duplicateResult.body, 'EMAIL_ALREADY_EXISTS');
    });

    it.each([
      { accountId: 'ab', code: 'INVALID_ACCOUNT_ID_LENGTH' },
      { accountId: 'aaaaaaaaaaaaaaaaaaaaa', code: 'INVALID_ACCOUNT_ID_LENGTH' },
      { accountId: 'invalid-id', code: 'INVALID_ACCOUNT_ID_FORMAT' },
    ])(
      '16.4 accountId 형식 위반($accountId) 시 $code 반환',
      async ({ accountId, code }) => {
        const result = await executeGraphql<CreateUserPayload>({
          query: CREATE_USER_MUTATION,
          variables: {
            input: createUserInput({ accountId }),
          },
        });

        expect(result.status).toBe(200);
        expectGraphqlError(result.body, code);
      },
    );

    it.each(['invalid-email', 'user @example.com', 'user@example .com'])(
      '16.5 email 형식 위반(%s) 시 INVALID_EMAIL_FORMAT 반환',
      async (email) => {
        const result = await executeGraphql<CreateUserPayload>({
          query: CREATE_USER_MUTATION,
          variables: {
            input: createUserInput({ email }),
          },
        });

        expect(result.status).toBe(200);
        expectGraphqlError(result.body, 'INVALID_EMAIL_FORMAT');
      },
    );

    it.each([
      { name: '', code: 'NAME_REQUIRED' },
      { name: ' '.repeat(5), code: 'NAME_REQUIRED' },
      { name: '가'.repeat(51), code: 'NAME_TOO_LONG' },
    ])('16.6 name 길이 위반 시 $code 반환', async ({ name, code }) => {
      const result = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: {
          input: createUserInput({ name }),
        },
      });

      expect(result.status).toBe(200);
      expectGraphqlError(result.body, code);
    });

    it.each([
      { password: 'Short1!a', code: 'PASSWORD_TOO_SHORT' },
      { password: `${'a'.repeat(71)}1!`, code: 'PASSWORD_TOO_LONG' },
      { password: 'PASSWORD123!', code: 'PASSWORD_MISSING_LOWERCASE' },
      { password: 'passwordonly!', code: 'PASSWORD_MISSING_NUMBER' },
      { password: 'password1234', code: 'PASSWORD_MISSING_SPECIAL_CHAR' },
    ])('16.7 비밀번호 정책 위반 시 $code 반환', async ({ password, code }) => {
      const result = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: {
          input: createUserInput({ password }),
        },
      });

      expect(result.status).toBe(200);
      expectGraphqlError(result.body, code);
    });

    it('16.8 저장된 비밀번호는 원본과 다른 hash로 저장된다', async () => {
      const input = createUserInput({ password: 'password1!a' });

      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const savedUser = await prisma.user.findUnique({
        where: { accountId: input.accountId },
      });

      expect(savedUser).toBeDefined();
      expect(savedUser?.passwordHash).not.toBe(input.password);
      expect(savedUser?.passwordHash.startsWith('$2')).toBe(true);
    });

    it('16.9 회원가입 응답에 password 필드가 포함되지 않는다', async () => {
      const input = createUserInput();
      const result = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      expect(result.status).toBe(200);
      expect(result.body.errors).toBeUndefined();
      expect(result.body.data?.createUser).toBeDefined();
      expect(result.body.data?.createUser).not.toHaveProperty('password');
      expect(result.body.data?.createUser).not.toHaveProperty('passwordHash');
    });
  });

  describe('17. Integration Tests - 로그인', () => {
    it('17.1 로그인 성공 시 사용자 정보를 반환한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      expect(loginResult.status).toBe(200);
      expect(loginResult.body.errors).toBeUndefined();
      expect(loginResult.body.data?.login.user).toMatchObject({
        accountId: input.accountId,
        email: input.email,
        name: input.name,
      });
    });

    it('17.2 로그인 성공 시 Set-Cookie에 httpOnly가 설정된다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      expect(loginResult.setCookie).toContain('HttpOnly');
    });

    it('17.3 쿠키 속성(name/path/httpOnly/secure/sameSite)을 설정한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      expect(loginResult.setCookie).toContain('accessToken=');
      expect(loginResult.setCookie).toContain('Path=/');
      expect(loginResult.setCookie).toContain('HttpOnly');
      expect(loginResult.setCookie).toContain('SameSite=Lax');
      expect(loginResult.setCookie).not.toContain('Domain=');
      expect(loginResult.setCookie).not.toContain('Secure');
    });

    it('17.4 로그인 응답 본문에 accessToken을 포함하지 않는다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      expect(loginResult.body.data?.login).toBeDefined();
      expect(loginResult.body.data?.login).not.toHaveProperty('accessToken');
    });

    it('17.5 존재하지 않는 accountId 로그인 시 INVALID_CREDENTIALS를 반환한다', async () => {
      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: 'unknown_user',
            password: 'password1!a',
          },
        },
      });

      expect(loginResult.status).toBe(200);
      expectGraphqlError(loginResult.body, 'INVALID_CREDENTIALS');
    });

    it('17.6 잘못된 비밀번호 로그인 시 INVALID_CREDENTIALS를 반환한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: 'wrong-password1!',
          },
        },
      });

      expect(loginResult.status).toBe(200);
      expectGraphqlError(loginResult.body, 'INVALID_CREDENTIALS');
    });

    it('17.7 계정 없음/비밀번호 불일치의 에러 메시지는 동일하다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const unknownAccountResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: 'unknown_user',
            password: input.password,
          },
        },
      });

      const wrongPasswordResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: 'wrong-password1!',
          },
        },
      });

      const unknownError = expectGraphqlError(
        unknownAccountResult.body,
        'INVALID_CREDENTIALS',
      );
      const wrongPasswordError = expectGraphqlError(
        wrongPasswordResult.body,
        'INVALID_CREDENTIALS',
      );

      expect(unknownError.message).toBe(wrongPasswordError.message);
    });

    it('17.8 동일 accountId+IP에서 10회 실패 시 ACCOUNT_TEMPORARILY_LOCKED를 반환한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      for (let i = 0; i < 9; i += 1) {
        const attempt = await executeGraphql<LoginPayload>({
          query: LOGIN_MUTATION,
          variables: {
            input: {
              accountId: input.accountId,
              password: 'wrong-password1!',
            },
          },
        });

        expectGraphqlError(attempt.body, 'INVALID_CREDENTIALS');
      }

      const tenthAttempt = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: 'wrong-password1!',
          },
        },
      });

      expectGraphqlError(tenthAttempt.body, 'ACCOUNT_TEMPORARILY_LOCKED');
    });

    it('17.9 잠금 10분 경과 후에는 다시 로그인할 수 있다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const nowSpy = jest.spyOn(Date, 'now');
      const baseTime = 1700000000000;

      for (let i = 0; i < 10; i += 1) {
        nowSpy.mockReturnValue(baseTime + i * 1000);
        await executeGraphql<LoginPayload>({
          query: LOGIN_MUTATION,
          variables: {
            input: {
              accountId: input.accountId,
              password: 'wrong-password1!',
            },
          },
        });
      }

      nowSpy.mockReturnValue(baseTime + 10 * 60 * 1000 + 10 * 1000);

      const unlockedResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      expect(unlockedResult.body.errors).toBeUndefined();
      expect(unlockedResult.body.data?.login.user.accountId).toBe(
        input.accountId,
      );
    });

    it('17.10 로그인 성공 시 실패 카운터를 초기화한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const nowSpy = jest.spyOn(Date, 'now');
      const baseTime = 1800000000000;

      for (let i = 0; i < 9; i += 1) {
        nowSpy.mockReturnValue(baseTime + i * 1000);
        await executeGraphql<LoginPayload>({
          query: LOGIN_MUTATION,
          variables: {
            input: {
              accountId: input.accountId,
              password: 'wrong-password1!',
            },
          },
        });
      }

      nowSpy.mockReturnValue(baseTime + 9 * 1000 + 1);
      const successResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });
      expect(successResult.body.errors).toBeUndefined();

      nowSpy.mockReturnValue(baseTime + 10 * 1000);
      const firstFailureAfterReset = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: 'wrong-password1!',
          },
        },
      });

      expectGraphqlError(firstFailureAfterReset.body, 'INVALID_CREDENTIALS');
    });
  });

  describe('18. Integration Tests - 인증 가드', () => {
    it('18.1 유효한 토큰으로 보호된 me Resolver 접근이 가능하다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      const token = extractAccessToken(loginResult.setCookie);
      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(meResult.status).toBe(200);
      expect(meResult.body.errors).toBeUndefined();
      expect(meResult.body.data?.me.accountId).toBe(input.accountId);
    });

    it('18.2 토큰 없이 me Resolver 접근 시 UNAUTHORIZED를 반환한다', async () => {
      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
      });

      expect(meResult.status).toBe(200);
      expectGraphqlError(meResult.body, 'UNAUTHORIZED');
    });

    it('18.3 만료된 토큰으로 접근 시 UNAUTHORIZED를 반환한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const nowSpy = jest.spyOn(Date, 'now');
      const baseTime = 1900000000000;
      nowSpy.mockReturnValue(baseTime);

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      nowSpy.mockReturnValue(baseTime + 16 * 60 * 1000);

      const token = extractAccessToken(loginResult.setCookie);
      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expectGraphqlError(meResult.body, 'UNAUTHORIZED');
    });

    it('18.4 Authorization 헤더의 Bearer 토큰을 추출해 인증한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      const token = extractAccessToken(loginResult.setCookie);
      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(meResult.body.errors).toBeUndefined();
      expect(meResult.body.data?.me.accountId).toBe(input.accountId);
    });

    it('18.5 accessToken 쿠키에서 토큰을 추출해 인증한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      const token = extractAccessToken(loginResult.setCookie);
      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(meResult.body.errors).toBeUndefined();
      expect(meResult.body.data?.me.accountId).toBe(input.accountId);
    });

    it('18.6 헤더와 쿠키가 모두 있으면 헤더 토큰을 우선 사용한다', async () => {
      const userA = createUserInput();
      const userB = createUserInput();

      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input: userA },
      });
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input: userB },
      });

      const loginA = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: userA.accountId,
            password: userA.password,
          },
        },
      });
      const loginB = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: userB.accountId,
            password: userB.password,
          },
        },
      });

      const headerToken = extractAccessToken(loginA.setCookie);
      const cookieToken = extractAccessToken(loginB.setCookie);

      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
        headers: {
          authorization: `Bearer ${headerToken}`,
          cookie: `accessToken=${cookieToken}`,
        },
      });

      expect(meResult.body.errors).toBeUndefined();
      expect(meResult.body.data?.me.accountId).toBe(userA.accountId);
    });

    it('18.7 @CurrentUser 데코레이터로 현재 사용자 정보에 접근한다', async () => {
      const input = createUserInput();
      await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      const token = extractAccessToken(loginResult.setCookie);
      const meResult = await executeGraphql<MePayload>({
        query: ME_QUERY,
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(meResult.body.errors).toBeUndefined();
      expect(meResult.body.data?.me).toMatchObject({
        accountId: input.accountId,
        email: input.email,
        name: input.name,
      });
    });

    it('18.8 공개 엔드포인트(createUser/login)는 인증 없이 접근 가능하다', async () => {
      const input = createUserInput();

      const createResult = await executeGraphql<CreateUserPayload>({
        query: CREATE_USER_MUTATION,
        variables: { input },
      });

      expect(createResult.body.errors).toBeUndefined();

      const loginResult = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: input.accountId,
            password: input.password,
          },
        },
      });

      expect(loginResult.body.errors).toBeUndefined();
      expect(loginResult.body.data?.login.user.accountId).toBe(input.accountId);
    });
  });

  describe('19. GraphQL 에러 형식 통일', () => {
    it('19.1 비즈니스 에러는 HTTP 200 + errors[].extensions.code를 반환한다', async () => {
      const result = await executeGraphql<LoginPayload>({
        query: LOGIN_MUTATION,
        variables: {
          input: {
            accountId: 'unknown_user',
            password: 'password1!a',
          },
        },
      });

      expect(result.status).toBe(200);
      expect(result.body.errors?.[0]?.extensions?.code).toBe(
        'INVALID_CREDENTIALS',
      );
    });
  });
});
