import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditPostForm } from './EditPostForm';

const mockFetchEditPost = vi.fn();
const mockFetchMe = vi.fn();
const mockUpdatePost = vi.fn();
const mockIssuePostImageUploadUrlForEdit = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock('./editPost.query', () => ({
  fetchEditPost: (...args: unknown[]) => mockFetchEditPost(...args),
}));

vi.mock('../../../../me/_components/me.query', () => ({
  fetchMe: (...args: unknown[]) => mockFetchMe(...args),
}));

vi.mock('./updatePost.mutation', () => ({
  updatePost: (...args: unknown[]) => mockUpdatePost(...args),
}));

vi.mock('./issuePostImageUploadUrl.mutation', () => ({
  issuePostImageUploadUrlForEdit: (...args: unknown[]) =>
    mockIssuePostImageUploadUrlForEdit(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

function createPost(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 'post-1',
    content: '기존 본문',
    subcontent: '기존 부제목',
    category: '',
    imageUrls: [
      'https://cdn.example.com/a.png',
      'https://cdn.example.com/b.png',
    ],
    authorId: 'author-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    __typename: 'Post' as const,
    ...overrides,
  };
}

describe('EditPostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchEditPost.mockResolvedValue({
      data: {
        post: createPost(),
      },
    });
    mockFetchMe.mockResolvedValue({
      data: {
        me: {
          id: 'author-1',
          accountId: 'author',
          email: 'author@nadoharu.com',
          name: '작성자',
          createdAt: '2026-01-01T00:00:00.000Z',
          __typename: 'User' as const,
        },
      },
    });
  });

  it('카테고리 입력을 노출하지 않는다', async () => {
    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/카테고리/i)).not.toBeInTheDocument();
  });

  it('수정 폼 진입 시 기존 게시물 데이터를 프리필한다', async () => {
    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toHaveValue('기존 본문');
    });
    expect(screen.getByLabelText(/보조 문구/i)).toHaveValue('기존 부제목');
  });

  it('존재하지 않는 게시물은 오류 상태와 목록 이동 액션을 표시한다', async () => {
    mockFetchEditPost.mockResolvedValue({
      data: {
        post: null,
      },
    });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(
        screen.getByText('존재하지 않는 게시물이거나 삭제된 게시물입니다.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: '목록으로 이동' })).toHaveAttribute(
      'href',
      '/posts',
    );
  });

  it('네트워크 오류는 재시도 동작을 제공한다', async () => {
    const user = userEvent.setup();
    mockFetchEditPost
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        data: {
          post: createPost(),
        },
      });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(
        screen.getByText('게시물 정보를 불러오지 못했어요.'),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toHaveValue('기존 본문');
    });
  });

  it('GraphQL 오류 응답은 게시물 없음이 아니라 재시도 가능한 오류로 처리한다', async () => {
    mockFetchEditPost.mockResolvedValue({
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

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(
        screen.getByText('게시물 정보를 불러오지 못했어요.'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: '다시 시도' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('존재하지 않는 게시물이거나 삭제된 게시물입니다.'),
    ).not.toBeInTheDocument();
  });

  it('비작성자가 접근하면 상세 화면으로 조기 이동한다', async () => {
    mockFetchMe.mockResolvedValue({
      data: {
        me: {
          id: 'other-user',
          accountId: 'other',
          email: 'other@nadoharu.com',
          name: '타인',
          createdAt: '2026-01-01T00:00:00.000Z',
          __typename: 'User' as const,
        },
      },
    });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/posts/post-1');
    });
  });

  it('수정 제출 시 imageUrls 최종 목록 전체와 빈 category를 전달한다', async () => {
    const user = userEvent.setup();
    mockUpdatePost.mockResolvedValue({
      data: {
        updatePost: {
          id: 'post-1',
        },
      },
    });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toHaveValue('기존 본문');
    });

    await user.clear(screen.getByLabelText(/본문/i));
    await user.type(screen.getByLabelText(/본문/i), '수정 본문');
    await user.click(screen.getByRole('button', { name: '수정하기' }));

    await waitFor(() => {
      expect(mockUpdatePost).toHaveBeenCalledWith({
        id: 'post-1',
        content: '수정 본문',
        subcontent: '기존 부제목',
        category: '',
        imageUrls: [
          'https://cdn.example.com/a.png',
          'https://cdn.example.com/b.png',
        ],
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith('/posts/post-1');
  });

  it('인증 오류 코드가 오면 로그인 유도 메시지와 링크를 표시한다', async () => {
    const user = userEvent.setup();
    mockUpdatePost.mockResolvedValue({
      errors: [
        {
          message: 'UNAUTHORIZED',
          extensions: {
            code: 'UNAUTHORIZED',
          },
        },
      ],
    });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toHaveValue('기존 본문');
    });

    await user.click(screen.getByRole('button', { name: '수정하기' }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      '로그인이 필요합니다. 다시 로그인해 주세요.',
    );
    expect(
      screen.getByRole('link', { name: '로그인하러 가기' }),
    ).toHaveAttribute('href', '/login');
  });

  it('권한 오류 코드가 오면 권한 없음 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    mockUpdatePost.mockResolvedValue({
      errors: [
        {
          message: 'POST_FORBIDDEN',
          extensions: {
            code: 'POST_FORBIDDEN',
          },
        },
      ],
    });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toHaveValue('기존 본문');
    });

    await user.click(screen.getByRole('button', { name: '수정하기' }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      '수정 권한이 없습니다.',
    );
    expect(
      screen.queryByRole('link', { name: '로그인하러 가기' }),
    ).not.toBeInTheDocument();
  });

  it('업로드 검증 실패 이후 재시도는 이전 실패 파일을 재사용하지 않는다', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const validFile = new File(['photo'], 'photo.png', { type: 'image/png' });
    const invalidFile = new File(['invalid'], 'invalid.bmp', {
      type: 'image/bmp',
    });

    mockIssuePostImageUploadUrlForEdit.mockResolvedValue({
      errors: [
        {
          message: 'POST_UPLOAD_FAILED',
          extensions: {
            code: 'POST_UPLOAD_FAILED',
          },
        },
      ],
    });

    render(<EditPostForm postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/본문/i)).toHaveValue('기존 본문');
    });

    await user.upload(screen.getByLabelText(/이미지 첨부/i), validFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '업로드 URL 발급에 실패했어요. 다시 시도해 주세요.',
    );
    expect(mockIssuePostImageUploadUrlForEdit).toHaveBeenCalledTimes(1);

    await user.upload(screen.getByLabelText(/이미지 첨부/i), invalidFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '지원하지 않는 이미지 형식입니다.',
    );

    await user.click(screen.getByRole('button', { name: '업로드 재시도' }));

    expect(mockIssuePostImageUploadUrlForEdit).toHaveBeenCalledTimes(1);
  });
});
