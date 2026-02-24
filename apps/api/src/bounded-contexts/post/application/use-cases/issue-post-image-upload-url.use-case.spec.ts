import {
  IssuePostImageUploadUrlOutput,
  PostImageUploadService,
} from '../ports/post-image-upload.service.interface';
import { IssuePostImageUploadUrlUseCase } from './issue-post-image-upload-url.use-case';
import { PostErrorCode } from '../../domain/errors/post.error';

describe('IssuePostImageUploadUrlUseCase', () => {
  let useCase: IssuePostImageUploadUrlUseCase;
  let uploadService: jest.Mocked<PostImageUploadService>;

  beforeEach(() => {
    uploadService = {
      issueUploadUrl: jest.fn(),
    };

    uploadService.issueUploadUrl.mockResolvedValue({
      uploadUrl: 'https://upload.example.com/signed-url',
      imageUrl:
        'https://cdn.example.com/users/550e8400-e29b-41d4-a716-446655440000/posts/1.gif',
      objectKey: 'users/550e8400-e29b-41d4-a716-446655440000/posts/1.gif',
      expiresInSeconds: 300,
    } as IssuePostImageUploadUrlOutput);

    useCase = new IssuePostImageUploadUrlUseCase(uploadService);
  });

  it('허용 포맷(gif)과 5MB 이하 파일로 presigned URL을 발급한다', async () => {
    const result = await useCase.execute({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      contentType: 'image/gif',
      fileSize: 1024,
    });

    expect(uploadService.issueUploadUrl).toHaveBeenCalledWith({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      contentType: 'image/gif',
      fileSize: 1024,
    });
    expect(result.uploadUrl).toContain('signed-url');
  });

  it('fileSize가 없으면 POST_UPLOAD_FILE_SIZE_REQUIRED를 반환한다', async () => {
    await expect(
      useCase.execute({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        contentType: 'image/png',
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.POST_UPLOAD_FILE_SIZE_REQUIRED,
    });
  });

  it('fileSize가 5MB를 초과하면 POST_UPLOAD_FILE_SIZE_EXCEEDED를 반환한다', async () => {
    await expect(
      useCase.execute({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        contentType: 'image/png',
        fileSize: 5 * 1024 * 1024 + 1,
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.POST_UPLOAD_FILE_SIZE_EXCEEDED,
    });
  });

  it('허용되지 않은 포맷이면 POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED를 반환한다', async () => {
    await expect(
      useCase.execute({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        contentType: 'image/svg+xml',
        fileSize: 100,
      }),
    ).rejects.toMatchObject({
      code: PostErrorCode.POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED,
    });
  });

  it.each(['text/png', 'application/gif'])(
    '비이미지 MIME 타입(%s)은 POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED를 반환한다',
    async (contentType) => {
      await expect(
        useCase.execute({
          userId: '550e8400-e29b-41d4-a716-446655440000',
          contentType,
          fileSize: 100,
        }),
      ).rejects.toMatchObject({
        code: PostErrorCode.POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED,
      });
    },
  );
});
