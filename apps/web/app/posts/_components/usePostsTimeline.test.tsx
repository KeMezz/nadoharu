import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostsTimeline } from './usePostsTimeline';

const mockFetchPostsTimeline = vi.fn();

vi.mock('./posts.query', () => ({
  fetchPostsTimeline: (...args: unknown[]) => mockFetchPostsTimeline(...args),
}));

type IntersectionCallback = ConstructorParameters<
  typeof IntersectionObserver
>[0];

class IntersectionObserverMock {
  callback: IntersectionCallback;

  constructor(callback: IntersectionCallback) {
    this.callback = callback;
  }

  observe = vi.fn();

  disconnect = vi.fn();

  trigger(isIntersecting: boolean) {
    this.callback(
      [
        {
          isIntersecting,
          target: document.createElement('div'),
        } as unknown as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

const observerInstances: IntersectionObserverMock[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  observerInstances.length = 0;
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn((callback: IntersectionCallback) => {
      const observer = new IntersectionObserverMock(callback);
      observerInstances.push(observer);
      return observer;
    }),
  );
});

function createPost(id: string) {
  return {
    id,
    content: `content-${id}`,
    subcontent: null,
    category: null,
    imageUrls: [],
    authorId: 'author-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    __typename: 'Post' as const,
  };
}

function createConnectionResponse(options: {
  ids: string[];
  hasNextPage: boolean;
  endCursor: string | null;
}) {
  return {
    data: {
      posts: {
        edges: options.ids.map((id) => ({
          cursor: `cursor-${id}`,
          node: createPost(id),
          __typename: 'PostEdge' as const,
        })),
        pageInfo: {
          hasNextPage: options.hasNextPage,
          endCursor: options.endCursor,
          __typename: 'PostPageInfo' as const,
        },
        __typename: 'PostConnection' as const,
      },
    },
  };
}

function TimelineHookHarness() {
  const {
    posts,
    hasNextPage,
    initialError,
    loadMoreError,
    sentinelRef,
    retryLoadMore,
  } = usePostsTimeline();

  return (
    <div>
      <p data-testid="post-count">{posts.length}</p>
      <p data-testid="has-next-page">{String(hasNextPage)}</p>
      <p data-testid="initial-error">{initialError ?? ''}</p>
      <p data-testid="load-more-error">{loadMoreError ?? ''}</p>
      <button type="button" onClick={() => void retryLoadMore()}>
        retry-load-more
      </button>
      <div data-testid="sentinel" ref={sentinelRef} />
    </div>
  );
}

describe('usePostsTimeline', () => {
  it('초기 로드 시 첫 페이지를 불러온다', async () => {
    mockFetchPostsTimeline.mockResolvedValue(
      createConnectionResponse({
        ids: ['1', '2'],
        hasNextPage: true,
        endCursor: 'next-1',
      }),
    );

    render(<TimelineHookHarness />);

    await waitFor(() => {
      expect(mockFetchPostsTimeline).toHaveBeenCalledWith({
        first: 10,
        after: null,
      });
    });
    expect(screen.getByTestId('post-count')).toHaveTextContent('2');
    expect(screen.getByTestId('has-next-page')).toHaveTextContent('true');
  });

  it('hasNextPage=false 상태에서는 추가 요청을 보내지 않는다', async () => {
    mockFetchPostsTimeline.mockResolvedValue(
      createConnectionResponse({
        ids: ['1'],
        hasNextPage: false,
        endCursor: null,
      }),
    );

    render(<TimelineHookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('post-count')).toHaveTextContent('1');
    });

    await act(async () => {
      observerInstances.at(-1)?.trigger(true);
    });

    expect(mockFetchPostsTimeline).toHaveBeenCalledTimes(1);
  });

  it('다음 페이지 로드 중 중복 요청을 막는다', async () => {
    let resolveLoadMore: (value: unknown) => void;
    mockFetchPostsTimeline
      .mockResolvedValueOnce(
        createConnectionResponse({
          ids: ['1'],
          hasNextPage: true,
          endCursor: 'next-1',
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveLoadMore = resolve;
        }),
      );

    render(<TimelineHookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('post-count')).toHaveTextContent('1');
    });

    await act(async () => {
      observerInstances.at(-1)?.trigger(true);
      observerInstances.at(-1)?.trigger(true);
    });

    expect(mockFetchPostsTimeline).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveLoadMore!(
        createConnectionResponse({
          ids: ['2'],
          hasNextPage: false,
          endCursor: null,
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('post-count')).toHaveTextContent('2');
    });
  });

  it('다음 페이지 실패 시 오류를 표시하고 재시도할 수 있다', async () => {
    mockFetchPostsTimeline
      .mockResolvedValueOnce(
        createConnectionResponse({
          ids: ['1'],
          hasNextPage: true,
          endCursor: 'next-1',
        }),
      )
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(
        createConnectionResponse({
          ids: ['2'],
          hasNextPage: false,
          endCursor: null,
        }),
      );

    render(<TimelineHookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('post-count')).toHaveTextContent('1');
    });

    await act(async () => {
      observerInstances.at(-1)?.trigger(true);
    });

    await waitFor(() => {
      expect(screen.getByTestId('load-more-error')).toHaveTextContent(
        'NETWORK_ERROR',
      );
    });

    await act(async () => {
      screen.getByRole('button', { name: 'retry-load-more' }).click();
    });

    await waitFor(() => {
      expect(mockFetchPostsTimeline).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId('post-count')).toHaveTextContent('2');
      expect(screen.getByTestId('load-more-error')).toHaveTextContent('');
    });
  });
});
