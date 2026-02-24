import { Post } from './post.entity';
import {
  PostValidationError,
  PostValidationErrorCode,
} from '../errors/post-validation.error';

describe('Post Entity', () => {
  const authorId = '550e8400-e29b-41d4-a716-446655440000';

  it('content 150자를 초과하면 POST_CONTENT_TOO_LONG 에러를 반환한다', () => {
    expect(() =>
      Post.create({
        authorId,
        content: 'a'.repeat(151),
        subcontent: null,
        category: null,
        imageUrls: [],
      }),
    ).toThrow(
      expect.objectContaining({
        code: PostValidationErrorCode.POST_CONTENT_TOO_LONG,
      } as Partial<PostValidationError>),
    );
  });

  it('subcontent 150자를 초과하면 POST_SUBCONTENT_TOO_LONG 에러를 반환한다', () => {
    expect(() =>
      Post.create({
        authorId,
        content: '본문',
        subcontent: 'b'.repeat(151),
        category: null,
        imageUrls: [],
      }),
    ).toThrow(
      expect.objectContaining({
        code: PostValidationErrorCode.POST_SUBCONTENT_TOO_LONG,
      } as Partial<PostValidationError>),
    );
  });

  it('이미지가 4장을 초과하면 POST_IMAGE_LIMIT_EXCEEDED 에러를 반환한다', () => {
    expect(() =>
      Post.create({
        authorId,
        content: '',
        subcontent: null,
        category: null,
        imageUrls: ['1', '2', '3', '4', '5'],
      }),
    ).toThrow(
      expect.objectContaining({
        code: PostValidationErrorCode.POST_IMAGE_LIMIT_EXCEEDED,
      } as Partial<PostValidationError>),
    );
  });

  it('공백 content와 빈 imageUrls 조합이면 POST_CONTENT_OR_IMAGE_REQUIRED 에러를 반환한다', () => {
    expect(() =>
      Post.create({
        authorId,
        content: '   ',
        subcontent: null,
        category: null,
        imageUrls: [],
      }),
    ).toThrow(
      expect.objectContaining({
        code: PostValidationErrorCode.POST_CONTENT_OR_IMAGE_REQUIRED,
      } as Partial<PostValidationError>),
    );
  });

  it('subcontent만 있고 본문/이미지가 없으면 POST_CONTENT_OR_IMAGE_REQUIRED 에러를 반환한다', () => {
    expect(() =>
      Post.create({
        authorId,
        content: '',
        subcontent: '보조 설명',
        category: null,
        imageUrls: [],
      }),
    ).toThrow(
      expect.objectContaining({
        code: PostValidationErrorCode.POST_CONTENT_OR_IMAGE_REQUIRED,
      } as Partial<PostValidationError>),
    );
  });

  it('category는 자유 문자열을 허용한다', () => {
    const post = Post.create({
      authorId,
      content: '카테고리 테스트',
      subcontent: null,
      category: 'my-custom-category',
      imageUrls: [],
    });

    expect(post.getCategory()).toBe('my-custom-category');
  });

  it('image-only 게시물을 허용한다', () => {
    const post = Post.create({
      authorId,
      content: '   ',
      subcontent: null,
      category: null,
      imageUrls: ['https://cdn.example.com/users/a/posts/1.png'],
    });

    expect(post.getContent()).toBe('');
    expect(post.getImageUrls()).toHaveLength(1);
  });
});
