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
  data?: TData | null;
  errors?: GraphQLErrorItem[];
}

interface CreateUserPayload {
  createUser: {
    id: string;
    accountId: string;
  };
}

interface LoginPayload {
  login: {
    user: {
      id: string;
      accountId: string;
    };
  };
}

interface CreatePostPayload {
  createPost: {
    id: string;
    content: string;
    imageUrls: string[];
    authorId: string;
  };
}

interface UpdatePostPayload {
  updatePost: {
    id: string;
    content: string;
    imageUrls: string[];
  };
}

interface DeletePostPayload {
  deletePost: boolean;
}

interface PostPayload {
  post: {
    id: string;
    content: string;
    authorId: string;
  } | null;
}

interface PostsPayload {
  posts: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        content: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      accountId
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        accountId
      }
    }
  }
`;

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      content
      imageUrls
      authorId
    }
  }
`;

const UPDATE_POST_MUTATION = `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      id
      content
      imageUrls
    }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input)
  }
`;

const POST_QUERY = `
  query Post($id: String!) {
    post(id: $id) {
      id
      content
      authorId
    }
  }
`;

const POSTS_QUERY = `
  query Posts($first: Int!, $after: String, $before: String, $last: Int) {
    posts(first: $first, after: $after, before: $before, last: $last) {
      edges {
        cursor
        node {
          id
          content
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

describe('PostResolver (Integration)', () => {
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
      R2_PUBLIC_URL: originalEnv.R2_PUBLIC_URL ?? 'https://cdn.example.com',
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
    await prisma.post.deleteMany({});
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

  function createUserInput() {
    sequence += 1;

    return {
      accountId: `post_user_${sequence}`,
      email: `post_user_${sequence}@example.com`,
      name: `포스트유저${sequence}`,
      password: 'password1!a',
    };
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

  function expectGraphqlError(
    body: GraphQLResponse<unknown>,
    code: string,
  ): GraphQLErrorItem {
    expect(body.data).toBeNull();
    expect(body.errors).toBeDefined();
    const firstError = body.errors?.[0];
    expect(firstError?.extensions?.code).toBe(code);
    return firstError as GraphQLErrorItem;
  }

  async function createUserAndLogin(): Promise<{
    userId: string;
    token: string;
  }> {
    const userInput = createUserInput();

    const createResult = await executeGraphql<CreateUserPayload>({
      query: CREATE_USER_MUTATION,
      variables: { input: userInput },
    });
    expect(createResult.body.errors).toBeUndefined();

    const loginResult = await executeGraphql<LoginPayload>({
      query: LOGIN_MUTATION,
      variables: {
        input: {
          accountId: userInput.accountId,
          password: userInput.password,
        },
      },
    });
    expect(loginResult.body.errors).toBeUndefined();

    const token = extractAccessToken(loginResult.setCookie);

    return {
      userId: createResult.body.data?.createUser.id ?? '',
      token,
    };
  }

  describe('Post CRUD', () => {
    it('createPost -> updatePost(imageUrls 교체) -> deletePost(소프트 삭제) 흐름이 동작한다', async () => {
      const { token, userId } = await createUserAndLogin();

      const createResult = await executeGraphql<CreatePostPayload>({
        query: CREATE_POST_MUTATION,
        variables: {
          input: {
            content: '첫 게시물',
            imageUrls: [
              `https://cdn.example.com/users/${userId}/posts/old.png`,
            ],
          },
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(createResult.body.errors).toBeUndefined();
      const postId = createResult.body.data?.createPost.id ?? '';

      const updateResult = await executeGraphql<UpdatePostPayload>({
        query: UPDATE_POST_MUTATION,
        variables: {
          input: {
            id: postId,
            content: '수정된 게시물',
            imageUrls: [
              `https://cdn.example.com/users/${userId}/posts/new.png`,
            ],
          },
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(updateResult.body.errors).toBeUndefined();
      expect(updateResult.body.data?.updatePost.imageUrls).toEqual([
        `https://cdn.example.com/users/${userId}/posts/new.png`,
      ]);

      const deleteResult = await executeGraphql<DeletePostPayload>({
        query: DELETE_POST_MUTATION,
        variables: {
          input: {
            id: postId,
          },
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(deleteResult.body.errors).toBeUndefined();
      expect(deleteResult.body.data?.deletePost).toBe(true);

      const deletedRecord = await prisma.post.findUnique({
        where: { id: postId },
      });
      expect(deletedRecord?.deletedAt).toBeTruthy();

      const postResult = await executeGraphql<PostPayload>({
        query: POST_QUERY,
        variables: { id: postId },
      });

      expect(postResult.body.errors).toBeUndefined();
      expect(postResult.body.data?.post).toBeNull();
    });

    it('비작성자 updatePost는 POST_FORBIDDEN을 반환한다', async () => {
      const author = await createUserAndLogin();
      const other = await createUserAndLogin();

      const createResult = await executeGraphql<CreatePostPayload>({
        query: CREATE_POST_MUTATION,
        variables: {
          input: {
            content: '작성자 게시물',
          },
        },
        headers: {
          cookie: `accessToken=${author.token}`,
        },
      });
      expect(createResult.body.errors).toBeUndefined();

      const updateByOther = await executeGraphql<UpdatePostPayload>({
        query: UPDATE_POST_MUTATION,
        variables: {
          input: {
            id: createResult.body.data?.createPost.id,
            content: '타 사용자 수정',
          },
        },
        headers: {
          cookie: `accessToken=${other.token}`,
        },
      });

      expectGraphqlError(updateByOther.body, 'POST_FORBIDDEN');
    });
  });

  describe('Timeline Pagination', () => {
    it('posts Connection 응답과 after 커서 페이지네이션이 중복/누락 없이 동작한다', async () => {
      const { token, userId } = await createUserAndLogin();

      const sameCreatedAt = new Date('2026-02-01T00:00:00.000Z');

      await prisma.post.createMany({
        data: [
          {
            id: '00000000-0000-0000-0000-000000000001',
            authorId: userId,
            content: 'oldest',
            subcontent: null,
            category: null,
            imageUrls: [],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            deletedAt: null,
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            authorId: userId,
            content: 'middle',
            subcontent: null,
            category: null,
            imageUrls: [],
            createdAt: sameCreatedAt,
            updatedAt: sameCreatedAt,
            deletedAt: null,
          },
          {
            id: '00000000-0000-0000-0000-000000000003',
            authorId: userId,
            content: 'latest',
            subcontent: null,
            category: null,
            imageUrls: [],
            createdAt: sameCreatedAt,
            updatedAt: sameCreatedAt,
            deletedAt: null,
          },
        ],
      });

      const firstPage = await executeGraphql<PostsPayload>({
        query: POSTS_QUERY,
        variables: {
          first: 2,
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(firstPage.body.errors).toBeUndefined();
      expect(firstPage.body.data?.posts.edges).toHaveLength(2);
      expect(firstPage.body.data?.posts.pageInfo.hasNextPage).toBe(true);
      expect(
        firstPage.body.data?.posts.edges.map((edge) => edge.node.id),
      ).toEqual([
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000002',
      ]);

      const secondPage = await executeGraphql<PostsPayload>({
        query: POSTS_QUERY,
        variables: {
          first: 2,
          after: firstPage.body.data?.posts.pageInfo.endCursor,
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(secondPage.body.errors).toBeUndefined();
      expect(
        secondPage.body.data?.posts.edges.map((edge) => edge.node.id),
      ).toEqual(['00000000-0000-0000-0000-000000000001']);
      expect(secondPage.body.data?.posts.pageInfo.hasNextPage).toBe(false);

      const firstPageIds =
        firstPage.body.data?.posts.edges.map((edge) => edge.node.id) ?? [];
      const secondPageIds =
        secondPage.body.data?.posts.edges.map((edge) => edge.node.id) ?? [];

      const overlap = firstPageIds.filter((id) => secondPageIds.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('before/last 파라미터 사용 시 UNSUPPORTED_PAGINATION_PARAM을 반환한다', async () => {
      const { token } = await createUserAndLogin();

      const beforeResult = await executeGraphql<PostsPayload>({
        query: POSTS_QUERY,
        variables: {
          first: 2,
          before: 'dummy',
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });
      expectGraphqlError(beforeResult.body, 'UNSUPPORTED_PAGINATION_PARAM');

      const lastResult = await executeGraphql<PostsPayload>({
        query: POSTS_QUERY,
        variables: {
          first: 2,
          last: 1,
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });
      expectGraphqlError(lastResult.body, 'UNSUPPORTED_PAGINATION_PARAM');
    });
  });

  describe('Access Control', () => {
    it('비인증 posts 조회는 UNAUTHORIZED를 반환한다', async () => {
      const result = await executeGraphql<PostsPayload>({
        query: POSTS_QUERY,
        variables: { first: 1 },
      });

      expectGraphqlError(result.body, 'UNAUTHORIZED');
    });

    it('비인증 post(id) 조회는 허용된다', async () => {
      const { token } = await createUserAndLogin();

      const createResult = await executeGraphql<CreatePostPayload>({
        query: CREATE_POST_MUTATION,
        variables: {
          input: {
            content: '공개 단건 조회 테스트',
          },
        },
        headers: {
          cookie: `accessToken=${token}`,
        },
      });

      expect(createResult.body.errors).toBeUndefined();
      const postId = createResult.body.data?.createPost.id ?? '';

      const postResult = await executeGraphql<PostPayload>({
        query: POST_QUERY,
        variables: { id: postId },
      });

      expect(postResult.body.errors).toBeUndefined();
      expect(postResult.body.data?.post?.id).toBe(postId);
    });
  });
});
