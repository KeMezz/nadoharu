import { Post } from '../../domain/entities/post.entity';
import { PostErrorCode } from '../../domain/errors/post.error';
import { PostRepository } from '../ports/post.repository.interface';
import { ListPostsUseCase } from './list-posts.use-case';

describe('ListPostsUseCase', () => {
  let useCase: ListPostsUseCase;
  let repository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findTimeline: jest.fn(),
    } as jest.Mocked<PostRepository>;

    repository.findTimeline.mockResolvedValue({
      posts: [],
      hasNextPage: false,
    });

    useCase = new ListPostsUseCase(repository);
  });

  it('first가 0 이하이면 UNSUPPORTED_PAGINATION_PARAM을 반환한다', async () => {
    await expect(
      useCase.execute({
        first: 0,
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.UNSUPPORTED_PAGINATION_PARAM,
    });

    expect(repository.findTimeline).not.toHaveBeenCalled();
  });

  it('before 파라미터를 전달하면 UNSUPPORTED_PAGINATION_PARAM을 반환한다', async () => {
    await expect(
      useCase.execute({
        first: 1,
        before: 'cursor',
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.UNSUPPORTED_PAGINATION_PARAM,
    });

    expect(repository.findTimeline).not.toHaveBeenCalled();
  });

  it('last 파라미터를 전달하면 UNSUPPORTED_PAGINATION_PARAM을 반환한다', async () => {
    await expect(
      useCase.execute({
        first: 1,
        last: 1,
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.UNSUPPORTED_PAGINATION_PARAM,
    });

    expect(repository.findTimeline).not.toHaveBeenCalled();
  });

  it('유효하지 않은 after 커서는 INVALID_PAGINATION_CURSOR를 반환한다', async () => {
    await expect(
      useCase.execute({
        first: 1,
        after: 'not-a-valid-cursor',
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.INVALID_PAGINATION_CURSOR,
    });

    expect(repository.findTimeline).not.toHaveBeenCalled();
  });

  it('after 커서를 디코딩해 저장소 조회에 전달한다', async () => {
    const createdAtIso = '2026-02-01T00:00:00.000Z';
    const after = Buffer.from(
      JSON.stringify({
        createdAt: createdAtIso,
        id: '00000000-0000-0000-0000-000000000001',
      }),
    ).toString('base64');

    const post = buildPost({
      id: '00000000-0000-0000-0000-000000000002',
      content: '테스트 게시물',
      createdAt: new Date('2026-02-01T00:00:01.000Z'),
      updatedAt: new Date('2026-02-01T00:00:01.000Z'),
    });

    repository.findTimeline.mockResolvedValue({
      posts: [post],
      hasNextPage: false,
    });

    const result = await useCase.execute({
      first: 1,
      after,
    });

    expect(repository.findTimeline).toHaveBeenCalledWith({
      first: 1,
      after: {
        createdAt: new Date(createdAtIso),
        id: '00000000-0000-0000-0000-000000000001',
      },
    });
    expect(result.edges).toHaveLength(1);
    expect(result.pageInfo.endCursor).not.toBeNull();
    expect(result.pageInfo.hasNextPage).toBe(false);
  });
});

function buildPost(params: {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): Post {
  return Post.reconstitute({
    id: params.id,
    authorId: '550e8400-e29b-41d4-a716-446655440000',
    content: params.content,
    subcontent: null,
    category: null,
    imageUrls: [],
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    deletedAt: null,
  });
}
