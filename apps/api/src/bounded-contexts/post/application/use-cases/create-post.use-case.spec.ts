import { PostRepository } from '../ports/post.repository.interface';
import { CreatePostUseCase } from './create-post.use-case';
import { PostErrorCode } from '../../domain/errors/post.error';
import { Post } from '../../domain/entities/post.entity';
import { PostImageUrlPolicy } from '../ports/post-image-url-policy.interface';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let repository: jest.Mocked<PostRepository>;
  let imageUrlPolicy: jest.Mocked<PostImageUrlPolicy>;

  const authorId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findTimeline: jest.fn(),
    } as jest.Mocked<PostRepository>;

    imageUrlPolicy = {
      getPublicUrl: jest.fn().mockReturnValue('https://cdn.example.com'),
    };

    repository.save.mockImplementation(async (post: Post) => post);

    useCase = new CreatePostUseCase(repository, imageUrlPolicy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 입력으로 게시물을 생성할 수 있다', async () => {
    const result = await useCase.execute({
      authorId,
      content: '오늘의 일상',
      subcontent: '점심 메뉴 기록',
      category: 'daily',
      imageUrls: [
        'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/1.png',
      ],
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(imageUrlPolicy.getPublicUrl).toHaveBeenCalledTimes(1);
    expect(result.getAuthorId()).toBe(authorId);
    expect(result.getContent()).toBe('오늘의 일상');
    expect(result.getImageUrls()).toHaveLength(1);
  });

  it('다른 사용자 prefix의 imageUrl은 POST_IMAGE_URL_NOT_ALLOWED를 반환한다', async () => {
    await expect(
      useCase.execute({
        authorId,
        content: '본문',
        imageUrls: [
          'https://cdn.example.com/users/11111111-1111-1111-1111-111111111111/posts/1.png',
        ],
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.POST_IMAGE_URL_NOT_ALLOWED,
    });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('R2_PUBLIC_URL에 base path가 있어도 동일 사용자 URL을 허용한다', async () => {
    imageUrlPolicy.getPublicUrl.mockReturnValue(
      'https://cdn.example.com/media',
    );

    const result = await useCase.execute({
      authorId,
      content: '본문',
      imageUrls: [
        'https://cdn.example.com/media/users/550e8400-e29b-41d4-a716-446655440000/posts/1.png',
      ],
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.getImageUrls()).toEqual([
      'https://cdn.example.com/media/users/550e8400-e29b-41d4-a716-446655440000/posts/1.png',
    ]);
  });
});
