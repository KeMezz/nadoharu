import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NewPostForm } from './NewPostForm';

const mockCreatePost = vi.fn();
const mockIssuePostImageUploadUrl = vi.fn();
const mockPush = vi.fn();
const originalFetch = globalThis.fetch;

vi.mock('./createPost.mutation', () => ({
  createPost: (...args: unknown[]) => mockCreatePost(...args),
}));

vi.mock('./issuePostImageUploadUrl.mutation', () => ({
  issuePostImageUploadUrl: (...args: unknown[]) =>
    mockIssuePostImageUploadUrl(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

describe('NewPostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('카테고리 입력을 노출하지 않는다', () => {
    render(<NewPostForm />);

    expect(screen.queryByLabelText(/카테고리/i)).not.toBeInTheDocument();
  });

  it('본문/이미지 모두 없으면 제출을 차단한다', async () => {
    const user = userEvent.setup();
    render(<NewPostForm />);

    await user.type(screen.getByLabelText(/본문/i), '   ');
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    expect(mockCreatePost).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '본문 또는 이미지를 하나 이상 입력해 주세요.',
    );
  });

  it('본문 길이가 150자를 넘으면 제출을 차단한다', async () => {
    const user = userEvent.setup();
    render(<NewPostForm />);

    await user.type(screen.getByLabelText(/본문/i), 'a'.repeat(151));
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    expect(mockCreatePost).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '본문은 150자 이하여야 합니다.',
    );
  });

  it('보조 문구 길이가 150자를 넘으면 제출을 차단한다', async () => {
    const user = userEvent.setup();
    render(<NewPostForm />);

    await user.type(screen.getByLabelText(/본문/i), '본문');
    await user.type(screen.getByLabelText(/보조 문구/i), 'a'.repeat(151));
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    expect(mockCreatePost).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '보조 문구는 150자 이하여야 합니다.',
    );
  });

  it('유효한 입력으로 제출하면 category를 빈 값으로 고정해 요청한다', async () => {
    const user = userEvent.setup();
    mockCreatePost.mockResolvedValue({
      data: {
        createPost: {
          id: 'post-1',
        },
      },
    });
    render(<NewPostForm />);

    await user.type(screen.getByLabelText(/본문/i), '오늘의 기록');
    await user.type(screen.getByLabelText(/보조 문구/i), '부제목');
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    expect(mockCreatePost).toHaveBeenCalledWith({
      content: '오늘의 기록',
      subcontent: '부제목',
      category: '',
      imageUrls: [],
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPush).toHaveBeenCalledWith('/posts/post-1');
  });

  it('본문이 비어도 이미지가 있으면 제출할 수 있다', async () => {
    const user = userEvent.setup();
    const imageFile = new File(['photo'], 'photo.png', { type: 'image/png' });

    mockIssuePostImageUploadUrl.mockResolvedValue({
      data: {
        issuePostImageUploadUrl: {
          uploadUrl: 'https://storage.example.com/upload',
          imageUrl: 'https://cdn.example.com/only-image.png',
          objectKey: 'users/u1/posts/only-image.png',
          expiresInSeconds: 300,
        },
      },
    });
    vi.mocked(fetch).mockResolvedValue(new Response('', { status: 200 }));
    mockCreatePost.mockResolvedValue({
      data: {
        createPost: {
          id: 'post-2',
        },
      },
    });

    render(<NewPostForm />);

    await user.upload(screen.getByLabelText(/이미지 첨부/i), imageFile);
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockCreatePost).toHaveBeenCalledWith({
      content: '',
      subcontent: null,
      category: '',
      imageUrls: ['https://cdn.example.com/only-image.png'],
    });
    expect(mockPush).toHaveBeenCalledWith('/posts/post-2');
  });

  it('제출 중에는 버튼을 비활성화한다', async () => {
    const user = userEvent.setup();
    let resolveCreatePost: (value: unknown) => void;
    mockCreatePost.mockReturnValue(
      new Promise((resolve) => {
        resolveCreatePost = resolve;
      }),
    );
    render(<NewPostForm />);

    await user.type(screen.getByLabelText(/본문/i), '오늘의 기록');
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    expect(screen.getByRole('button', { name: '작성 중...' })).toBeDisabled();

    await act(async () => {
      resolveCreatePost!({
        data: {
          createPost: {
            id: 'post-1',
          },
        },
      });
    });
  });

  it('인증 오류 코드가 오면 로그인 유도 메시지와 링크를 표시한다', async () => {
    const user = userEvent.setup();
    mockCreatePost.mockResolvedValue({
      errors: [
        {
          message: 'UNAUTHORIZED',
          extensions: {
            code: 'UNAUTHORIZED',
          },
        },
      ],
    });

    render(<NewPostForm />);

    await user.type(screen.getByLabelText(/본문/i), '오늘의 기록');
    await user.click(screen.getByRole('button', { name: '작성하기' }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      '로그인이 필요합니다. 다시 로그인해 주세요.',
    );
    expect(
      screen.getByRole('link', { name: '로그인하러 가기' }),
    ).toHaveAttribute('href', '/login');
  });

  it('지원하지 않는 파일 포맷이면 presigned URL 발급을 시도하지 않는다', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<NewPostForm />);

    const file = new File(['invalid'], 'invalid.bmp', { type: 'image/bmp' });
    await user.upload(screen.getByLabelText(/이미지 첨부/i), file);

    expect(mockIssuePostImageUploadUrl).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '지원하지 않는 이미지 형식입니다.',
    );
  });

  it('용량 초과 파일이면 presigned URL 발급을 시도하지 않는다', async () => {
    const user = userEvent.setup();
    render(<NewPostForm />);

    const file = new File(['x'.repeat(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    await user.upload(screen.getByLabelText(/이미지 첨부/i), file);

    expect(mockIssuePostImageUploadUrl).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미지는 최대 5MB까지 업로드할 수 있습니다.',
    );
  });

  it('presigned URL 발급 실패와 업로드 실패를 구분하고 재시도할 수 있다', async () => {
    const user = userEvent.setup();
    const imageFile = new File(['photo'], 'photo.png', { type: 'image/png' });

    mockIssuePostImageUploadUrl
      .mockResolvedValueOnce({
        errors: [
          {
            message: 'POST_UPLOAD_FAILED',
            extensions: {
              code: 'POST_UPLOAD_FAILED',
            },
          },
        ],
      })
      .mockResolvedValue({
        data: {
          issuePostImageUploadUrl: {
            uploadUrl: 'https://storage.example.com/upload',
            imageUrl: 'https://cdn.example.com/new.png',
            objectKey: 'users/u1/posts/new.png',
            expiresInSeconds: 300,
          },
        },
      });

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('failed', { status: 500 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }));

    render(<NewPostForm />);

    await user.upload(screen.getByLabelText(/이미지 첨부/i), imageFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '업로드 URL 발급에 실패했어요. 다시 시도해 주세요.',
    );
    await user.click(screen.getByRole('button', { name: '업로드 재시도' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미지 업로드에 실패했어요. 다시 시도해 주세요.',
    );

    await user.click(screen.getByRole('button', { name: '업로드 재시도' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByAltText('업로드 이미지 1')).toBeInTheDocument();
  });

  it('업로드 검증 실패 이후 재시도는 이전 실패 파일을 재사용하지 않는다', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const validFile = new File(['photo'], 'photo.png', { type: 'image/png' });
    const invalidFile = new File(['invalid'], 'invalid.bmp', {
      type: 'image/bmp',
    });

    mockIssuePostImageUploadUrl.mockResolvedValue({
      errors: [
        {
          message: 'POST_UPLOAD_FAILED',
          extensions: {
            code: 'POST_UPLOAD_FAILED',
          },
        },
      ],
    });

    render(<NewPostForm />);

    await user.upload(screen.getByLabelText(/이미지 첨부/i), validFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '업로드 URL 발급에 실패했어요. 다시 시도해 주세요.',
    );
    expect(mockIssuePostImageUploadUrl).toHaveBeenCalledTimes(1);

    await user.upload(screen.getByLabelText(/이미지 첨부/i), invalidFile);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '지원하지 않는 이미지 형식입니다.',
    );

    await user.click(screen.getByRole('button', { name: '업로드 재시도' }));

    expect(mockIssuePostImageUploadUrl).toHaveBeenCalledTimes(1);
  });
});
