import { PostErrorCode } from '../../domain/errors/post.error';
import { assertPostImageUrlsAllowed } from './validate-post-image-urls';

describe('assertPostImageUrlsAllowed', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';

  it('publicUrl에 path가 포함되면 base path를 포함한 URL을 허용한다', () => {
    expect(() =>
      assertPostImageUrlsAllowed({
        userId,
        publicUrl: 'https://cdn.example.com/media',
        imageUrls: [
          `https://cdn.example.com/media/users/${userId}/posts/1.png`,
        ],
      }),
    ).not.toThrow();
  });

  it('publicUrl base path가 다른 URL은 거부한다', () => {
    expect(() =>
      assertPostImageUrlsAllowed({
        userId,
        publicUrl: 'https://cdn.example.com/media',
        imageUrls: [`https://cdn.example.com/users/${userId}/posts/1.png`],
      }),
    ).toThrow(
      expect.objectContaining({
        code: PostErrorCode.POST_IMAGE_URL_NOT_ALLOWED,
      }),
    );
  });
});
