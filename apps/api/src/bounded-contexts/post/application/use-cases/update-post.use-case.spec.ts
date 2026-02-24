import { PostRepository } from '../ports/post.repository.interface';
import { UpdatePostUseCase } from './update-post.use-case';
import { Post } from '../../domain/entities/post.entity';
import { PostErrorCode } from '../../domain/errors/post.error';

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let repository: jest.Mocked<PostRepository>;

  const authorId = '550e8400-e29b-41d4-a716-446655440000';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(() => {
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com';

    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findTimeline: jest.fn(),
    } as jest.Mocked<PostRepository>;

    repository.save.mockImplementation(async (post: Post) => post);

    useCase = new UpdatePostUseCase(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('작성자가 imageUrls를 포함해 수정하면 기존 목록을 전체 교체한다', async () => {
    const post = buildPost({
      imageUrls: [
        'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/old.png',
      ],
    });

    repository.findById.mockResolvedValue(post);

    const result = await useCase.execute({
      postId: post.getId(),
      userId: authorId,
      content: '수정된 본문',
      imageUrls: [
        'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/new.png',
      ],
    });

    expect(result.getImageUrls()).toEqual([
      'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/new.png',
    ]);
  });

  it('imageUrls를 생략하면 기존 이미지 목록을 유지한다', async () => {
    const post = buildPost({
      imageUrls: [
        'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/keep.png',
      ],
    });

    repository.findById.mockResolvedValue(post);

    const result = await useCase.execute({
      postId: post.getId(),
      userId: authorId,
      content: '본문만 수정',
    });

    expect(result.getImageUrls()).toEqual([
      'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/keep.png',
    ]);
  });

  it('비작성자 수정 시 POST_FORBIDDEN을 반환한다', async () => {
    const post = buildPost();
    repository.findById.mockResolvedValue(post);

    await expect(
      useCase.execute({
        postId: post.getId(),
        userId: otherUserId,
        content: '권한 없는 수정',
      }),
    ).rejects.toMatchObject({ code: PostErrorCode.POST_FORBIDDEN });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('다른 사용자 prefix의 imageUrl로 수정하면 POST_IMAGE_URL_NOT_ALLOWED를 반환한다', async () => {
    const post = buildPost();
    repository.findById.mockResolvedValue(post);

    await expect(
      useCase.execute({
        postId: post.getId(),
        userId: authorId,
        content: '수정',
        imageUrls: [
          'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440001/posts/other.png',
        ],
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.POST_IMAGE_URL_NOT_ALLOWED,
    });
  });

  it('R2_PUBLIC_URL에 base path가 있어도 동일 사용자 URL을 허용한다', async () => {
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com/media';

    const post = buildPost({
      imageUrls: [
        'https://cdn.example.com/media/users/550e8400-e29b-41d4-a716-446655440000/posts/old.png',
      ],
    });
    repository.findById.mockResolvedValue(post);

    const result = await useCase.execute({
      postId: post.getId(),
      userId: authorId,
      content: '수정',
      imageUrls: [
        'https://cdn.example.com/media/users/550e8400-e29b-41d4-a716-446655440000/posts/new.png',
      ],
    });

    expect(result.getImageUrls()).toEqual([
      'https://cdn.example.com/media/users/550e8400-e29b-41d4-a716-446655440000/posts/new.png',
    ]);
  });
});

function buildPost(params?: {
  id?: string;
  content?: string;
  imageUrls?: string[];
}): Post {
  return Post.reconstitute({
    id: params?.id ?? '00000000-0000-0000-0000-000000000001',
    authorId: '550e8400-e29b-41d4-a716-446655440000',
    content: params?.content ?? '원본 본문',
    subcontent: null,
    category: null,
    imageUrls: params?.imageUrls ?? [
      'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/default.png',
    ],
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    deletedAt: null,
  });
}
