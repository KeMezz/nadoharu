import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PostsPageContent } from './PostsPageContent';

const mockPostsTimeline = vi.fn(() => <div>타임라인</div>);

vi.mock('./PostsTimeline', () => ({
  PostsTimeline: () => mockPostsTimeline(),
}));

describe('PostsPageContent', () => {
  it('비인증 사용자에게 로그인 안내와 이동 버튼을 표시한다', () => {
    render(<PostsPageContent authenticated={false} />);

    expect(screen.getByText('로그인이 필요한 피드예요')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '로그인하러 가기' }),
    ).toHaveAttribute('href', '/login');
  });

  it('비인증 사용자 상태에서는 타임라인을 렌더링하지 않는다', () => {
    render(<PostsPageContent authenticated={false} />);

    expect(mockPostsTimeline).not.toHaveBeenCalled();
  });

  it('인증 사용자에게 타임라인을 렌더링한다', () => {
    render(<PostsPageContent authenticated />);

    expect(mockPostsTimeline).toHaveBeenCalledTimes(1);
    expect(screen.getByText('타임라인')).toBeInTheDocument();
  });
});
