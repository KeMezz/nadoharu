import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePostDetail } from './usePostDetail';

const mockFetchPostDetail = vi.fn();

vi.mock('./post.query', () => ({
  fetchPostDetail: (...args: unknown[]) => mockFetchPostDetail(...args),
}));

function createPost(id: string) {
  return {
    __typename: 'Post' as const,
    id,
    content: `content-${id}`,
    subcontent: null,
    category: null,
    imageUrls: [],
    authorId: 'author-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function HookHarness() {
  const { post, loading, notFound, transientError, retry } =
    usePostDetail('post-1');

  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="not-found">{String(notFound)}</p>
      <p data-testid="transient-error">{String(transientError)}</p>
      <p data-testid="post-id">{post?.id ?? ''}</p>
      <button type="button" onClick={() => void retry()}>
        retry
      </button>
    </div>
  );
}

describe('usePostDetail', () => {
  it('비인증 상태에서도 유효한 ID면 단건 상세를 표시한다', async () => {
    mockFetchPostDetail.mockResolvedValue({
      data: {
        post: createPost('post-1'),
      },
    });

    render(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(mockFetchPostDetail).toHaveBeenCalledWith({ id: 'post-1' });
    expect(screen.getByTestId('post-id')).toHaveTextContent('post-1');
    expect(screen.getByTestId('not-found')).toHaveTextContent('false');
  });

  it('존재하지 않는 ID면 notFound 상태를 표시한다', async () => {
    mockFetchPostDetail.mockResolvedValue({
      data: {
        post: null,
      },
    });

    render(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('not-found')).toHaveTextContent('true');
    expect(screen.getByTestId('post-id')).toHaveTextContent('');
  });

  it('GraphQL 오류 응답이면 notFound가 아니라 transientError로 처리한다', async () => {
    mockFetchPostDetail.mockResolvedValue({
      data: {
        post: null,
      },
      errors: [
        {
          message: 'INTERNAL_SERVER_ERROR',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        },
      ],
    });

    render(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('transient-error')).toHaveTextContent('true');
    expect(screen.getByTestId('not-found')).toHaveTextContent('false');
  });

  it('일시적 오류가 나면 재시도에서 복구할 수 있다', async () => {
    mockFetchPostDetail
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        data: {
          post: createPost('post-1'),
        },
      });

    render(<HookHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('transient-error')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByRole('button', { name: 'retry' }).click();
    });

    await waitFor(() => {
      expect(mockFetchPostDetail.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByTestId('transient-error')).toHaveTextContent('false');
      expect(screen.getByTestId('post-id')).toHaveTextContent('post-1');
    });
  });
});
