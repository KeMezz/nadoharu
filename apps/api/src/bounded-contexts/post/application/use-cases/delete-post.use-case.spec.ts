import { PostRepository } from '../ports/post.repository.interface';
import { DeletePostUseCase } from './delete-post.use-case';
import { Post } from '../../domain/entities/post.entity';
import { PostErrorCode } from '../../domain/errors/post.error';

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;
  let repository: jest.Mocked<PostRepository>;

  const authorId = '550e8400-e29b-41d4-a716-446655440000';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findTimeline: jest.fn(),
    } as jest.Mocked<PostRepository>;

    repository.save.mockImplementation(async (post: Post) => post);

    useCase = new DeletePostUseCase(repository);
  });

  it('작성자는 게시물을 소프트 삭제할 수 있다', async () => {
    const post = buildPost();
    repository.findById.mockResolvedValue(post);

    const result = await useCase.execute({
      postId: post.getId(),
      userId: authorId,
    });

    const saved = repository.save.mock.calls[0]?.[0];

    expect(result).toBe(true);
    expect(saved?.getDeletedAt()).toBeInstanceOf(Date);
  });

  it('비작성자가 삭제하면 POST_FORBIDDEN을 반환한다', async () => {
    const post = buildPost();
    repository.findById.mockResolvedValue(post);

    await expect(
      useCase.execute({
        postId: post.getId(),
        userId: otherUserId,
      }),
    ).rejects.toMatchObject({ code: PostErrorCode.POST_FORBIDDEN });
  });

  it('게시물이 없으면 POST_NOT_FOUND를 반환한다', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        postId: 'not-found',
        userId: authorId,
      }),
    ).rejects.toMatchObject({ code: PostErrorCode.POST_NOT_FOUND });
  });
});

function buildPost(): Post {
  return Post.reconstitute({
    id: '00000000-0000-0000-0000-000000000001',
    authorId: '550e8400-e29b-41d4-a716-446655440000',
    content: '본문',
    subcontent: null,
    category: null,
    imageUrls: [
      'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/default.png',
    ],
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    deletedAt: null,
  });
}
