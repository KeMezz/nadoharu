import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PostErrorCode } from '../../domain/errors/post.error';
import { R2PostImageUploadService } from './r2-post-image-upload.service';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn().mockImplementation((input: unknown) => input),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('R2PostImageUploadService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      R2_ENDPOINT: 'https://example-r2.cloudflare.com',
      R2_BUCKET_NAME: 'nadoharu-post-images',
      R2_ACCESS_KEY_ID: 'access-key',
      R2_SECRET_ACCESS_KEY: 'secret-key',
      R2_PUBLIC_URL: 'https://cdn.example.com',
    };

    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://upload.example.com/signed-url',
    );
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('S3Client는 생성자에서 한 번만 초기화한다', async () => {
    const service = new R2PostImageUploadService();

    await service.issueUploadUrl({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      contentType: 'image/png',
      fileSize: 1024,
    });

    await service.issueUploadUrl({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      contentType: 'image/png',
      fileSize: 2048,
    });

    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(getSignedUrl).toHaveBeenCalledTimes(2);
  });

  it('필수 환경변수가 없으면 생성자에서 POST_UPLOAD_NOT_CONFIGURED를 던진다', () => {
    process.env = {
      ...originalEnv,
      R2_ENDPOINT: 'https://example-r2.cloudflare.com',
      R2_BUCKET_NAME: 'nadoharu-post-images',
      R2_ACCESS_KEY_ID: '',
      R2_SECRET_ACCESS_KEY: 'secret-key',
      R2_PUBLIC_URL: 'https://cdn.example.com',
    };

    expect(() => new R2PostImageUploadService()).toThrow(
      expect.objectContaining({
        code: PostErrorCode.POST_UPLOAD_NOT_CONFIGURED,
      }),
    );
  });
});
