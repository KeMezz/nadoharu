import { Inject, Injectable } from '@nestjs/common';
import {
  IssuePostImageUploadUrlOutput,
  PostImageUploadService,
  POST_IMAGE_UPLOAD_SERVICE,
} from '../ports/post-image-upload.service.interface';
import { PostError, PostErrorCode } from '../../domain/errors/post.error';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FORMATS = new Set([
  'jpeg',
  'jpg',
  'png',
  'webp',
  'heic',
  'heif',
  'gif',
]);

export interface IssuePostImageUploadUrlUseCaseInput {
  userId: string;
  contentType: string;
  fileSize?: number | null;
}

@Injectable()
export class IssuePostImageUploadUrlUseCase {
  constructor(
    @Inject(POST_IMAGE_UPLOAD_SERVICE)
    private readonly postImageUploadService: PostImageUploadService,
  ) {}

  async execute(
    input: IssuePostImageUploadUrlUseCaseInput,
  ): Promise<IssuePostImageUploadUrlOutput> {
    if (input.fileSize == null || input.fileSize <= 0) {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_FILE_SIZE_REQUIRED,
        'fileSize는 필수이며 0보다 커야 합니다.',
      );
    }

    if (input.fileSize > MAX_FILE_SIZE) {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_FILE_SIZE_EXCEEDED,
        '파일 크기는 5MB를 초과할 수 없습니다.',
      );
    }

    const normalizedContentType = normalizeContentType(input.contentType);

    return await this.postImageUploadService.issueUploadUrl({
      userId: input.userId,
      contentType: normalizedContentType,
      fileSize: input.fileSize,
    });
  }
}

function normalizeContentType(contentType: string): string {
  const normalized = contentType.trim().toLowerCase();
  const mimeType = normalized.split(';')[0]?.trim() ?? '';

  if (mimeType.includes('/')) {
    const [majorType, subType] = mimeType.split('/', 2);
    if (majorType !== 'image') {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED,
        '허용되지 않은 이미지 포맷입니다.',
      );
    }

    if (!ALLOWED_FORMATS.has(subType ?? '')) {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED,
        '허용되지 않은 이미지 포맷입니다.',
      );
    }

    return `image/${subType}`;
  }

  if (!ALLOWED_FORMATS.has(mimeType)) {
    throw new PostError(
      PostErrorCode.POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED,
      '허용되지 않은 이미지 포맷입니다.',
    );
  }

  return `image/${mimeType}`;
}
