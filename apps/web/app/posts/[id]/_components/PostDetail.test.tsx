import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostDetail } from './PostDetail';

const mockUsePostDetail = vi.fn();

vi.mock('./usePostDetail', () => ({
  usePostDetail: (...args: unknown[]) => mockUsePostDetail(...args),
}));

describe('PostDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('존재하지 않는 게시물에서 목록 이동 액션을 제공한다', () => {
    mockUsePostDetail.mockReturnValue({
      post: null,
      loading: false,
      notFound: true,
      transientError: false,
      retry: vi.fn(),
    });

    render(<PostDetail postId="post-1" />);

    expect(screen.getByText('게시물을 찾을 수 없어요')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '목록으로 이동' })).toHaveAttribute(
      'href',
      '/posts',
    );
  });

  it('일시적 오류에서 재시도와 목록 이동 액션을 제공한다', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    mockUsePostDetail.mockReturnValue({
      post: null,
      loading: false,
      notFound: false,
      transientError: true,
      retry,
    });

    render(<PostDetail postId="post-1" />);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: '목록으로 이동' })).toHaveAttribute(
      'href',
      '/posts',
    );
  });
});
