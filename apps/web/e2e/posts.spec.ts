import { test, expect } from '@playwright/test';

function postPayload(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 'post-1',
    content: '기본 게시물',
    subcontent: '기본 부제목',
    category: '',
    imageUrls: [],
    authorId: 'author-1',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    ...overrides,
  };
}

test.describe('게시물 라우트 - 비인증 사용자', () => {
  test('비인증 사용자는 /posts에서 로그인 안내를 본다', async ({ page }) => {
    let graphqlCallCount = 0;
    await page.route('**/api/graphql', async (route) => {
      graphqlCallCount += 1;
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/posts');

    await expect(page).toHaveURL(/\/posts$/);
    await expect(page.getByText('로그인이 필요한 피드예요')).toBeVisible();
    await expect(
      page.getByRole('link', { name: '로그인하러 가기' }),
    ).toHaveAttribute('href', '/login');
    expect(graphqlCallCount).toBe(0);
  });

  test('비인증 사용자는 /posts/[id] 상세를 조회할 수 있다', async ({
    page,
  }) => {
    await page.route('**/api/graphql', async (route) => {
      const payload = route.request().postDataJSON() as {
        query: string;
      };

      if (payload.query.includes('query PostDetail')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              post: postPayload({
                id: 'public-post',
                content: '비인증 공개 상세',
              }),
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/posts/public-post');

    await expect(page).toHaveURL(/\/posts\/public-post$/);
    await expect(page.getByText('비인증 공개 상세')).toBeVisible();
  });
});

test.describe('게시물 타임라인 - 인증 사용자', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('타임라인에서 다음 페이지를 추가 로드한다', async ({ page }) => {
    let postsCallCount = 0;
    await page.route('**/api/graphql', async (route) => {
      const payload = route.request().postDataJSON() as {
        query: string;
        variables?: { after?: string | null };
      };

      if (payload.query.includes('query PostsTimeline')) {
        postsCallCount += 1;

        if (postsCallCount === 1) {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: {
                posts: {
                  edges: [
                    {
                      cursor: 'cursor-1',
                      node: postPayload({
                        id: 'post-1',
                        content: '첫 페이지 게시물',
                      }),
                    },
                  ],
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: 'cursor-1',
                  },
                },
              },
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              posts: {
                edges: [
                  {
                    cursor: 'cursor-2',
                    node: postPayload({
                      id: 'post-2',
                      content: '두 번째 게시물',
                    }),
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/posts');

    await expect(page.getByText('첫 페이지 게시물')).toBeVisible();
    await expect(page.getByText('두 번째 게시물')).toBeVisible();
    expect(postsCallCount).toBeGreaterThanOrEqual(2);
  });

  test('다음 페이지 실패 후 재시도하면 목록을 유지한 채 복구한다', async ({
    page,
  }) => {
    let postsCallCount = 0;
    await page.route('**/api/graphql', async (route) => {
      const payload = route.request().postDataJSON() as { query: string };

      if (payload.query.includes('query PostsTimeline')) {
        postsCallCount += 1;

        if (postsCallCount === 1) {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              data: {
                posts: {
                  edges: [
                    {
                      cursor: 'cursor-1',
                      node: postPayload({
                        id: 'post-1',
                        content: '유지되어야 할 게시물',
                      }),
                    },
                  ],
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: 'cursor-1',
                  },
                },
              },
            }),
          });
          return;
        }

        if (postsCallCount === 2) {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              errors: [
                {
                  message: 'NETWORK_ERROR',
                  extensions: { code: 'NETWORK_ERROR' },
                },
              ],
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              posts: {
                edges: [
                  {
                    cursor: 'cursor-2',
                    node: postPayload({
                      id: 'post-2',
                      content: '재시도 성공 게시물',
                    }),
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/posts');

    await expect(page.getByText('유지되어야 할 게시물')).toBeVisible();
    await expect(
      page.getByText('다음 게시물을 불러오지 못했어요.'),
    ).toBeVisible();
    await page
      .getByRole('button', { name: '다시 시도' })
      .click({ force: true })
      .catch(() => {
        return;
      });
    await expect(page.getByText('재시도 성공 게시물')).toBeVisible();
  });
});

test.describe('게시물 작성/수정 흐름', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('게시물 작성 성공 후 /posts/[id]로 이동한다', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const payload = route.request().postDataJSON() as { query: string };

      if (payload.query.includes('mutation CreatePost')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              createPost: postPayload({
                id: 'created-post',
                content: '작성 완료 게시물',
                subcontent: '작성 완료 부제목',
              }),
            },
          }),
        });
        return;
      }

      if (payload.query.includes('query PostDetail')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              post: postPayload({
                id: 'created-post',
                content: '작성 완료 게시물',
                subcontent: '작성 완료 부제목',
              }),
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/posts/new');
    await page.getByLabel('본문').click();
    await page.getByLabel('본문').type('작성 완료 게시물');
    await page.getByLabel('보조 문구').click();
    await page.getByLabel('보조 문구').type('작성 완료 부제목');
    await page.getByRole('button', { name: '작성하기' }).click({ force: true });

    await expect(page).toHaveURL(/\/posts\/created-post$/);
    await expect(page.getByText('작성 완료 게시물')).toBeVisible();
  });

  test('게시물 수정 성공 후 /posts/[id]로 이동한다', async ({ page }) => {
    await page.route('**/api/graphql', async (route) => {
      const payload = route.request().postDataJSON() as { query: string };

      if (payload.query.includes('query EditPost')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              post: postPayload({
                id: 'edit-target',
                content: '수정 전 게시물',
              }),
            },
          }),
        });
        return;
      }

      if (payload.query.includes('query Me')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              me: {
                id: 'author-1',
                accountId: 'author1',
                email: 'author1@nadoharu.com',
                name: '작성자',
                createdAt: '2026-02-01T10:00:00.000Z',
              },
            },
          }),
        });
        return;
      }

      if (payload.query.includes('mutation UpdatePost')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              updatePost: postPayload({
                id: 'edit-target',
                content: '수정 완료 게시물',
              }),
            },
          }),
        });
        return;
      }

      if (payload.query.includes('query PostDetail')) {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              post: postPayload({
                id: 'edit-target',
                content: '수정 완료 게시물',
              }),
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: {} }),
      });
    });

    await page.goto('/posts/edit-target/edit');
    await page.getByLabel('본문').fill('수정 완료 게시물');
    await page.getByRole('button', { name: '수정하기' }).click();

    await expect(page).toHaveURL(/\/posts\/edit-target$/);
    await expect(page.getByText('수정 완료 게시물')).toBeVisible();
  });
});
