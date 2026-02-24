import { PostRepository } from '../ports/post.repository.interface';
import { GetPostUseCase } from './get-post.use-case';
import { Post } from '../../domain/entities/post.entity';

describe('GetPostUseCase', () => {
  let useCase: GetPostUseCase;
  let repository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findTimeline: jest.fn(),
    } as jest.Mocked<PostRepository>;

    useCase = new GetPostUseCase(repository);
  });

  it('게시물이 존재하면 반환한다', async () => {
    const post = Post.reconstitute({
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

    repository.findById.mockResolvedValue(post);

    const result = await useCase.execute({ postId: post.getId() });

    expect(result?.getId()).toBe(post.getId());
  });

  it('게시물이 없으면 null을 반환한다', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ postId: 'not-found' });

    expect(result).toBeNull();
  });
});
