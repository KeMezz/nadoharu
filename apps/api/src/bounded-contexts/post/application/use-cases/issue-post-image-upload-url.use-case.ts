import { Inject, Injectable } from '@nestjs/common';
import {
  IssuePostImageUploadUrlOutput,
  PostImageUploadService,
  POST_IMAGE_UPLOAD_SERVICE,
} from '../ports/post-image-upload.service.interface';
import { PostError, PostErrorCode } from '../../domain/errors/post.error';
import {
  normalizePostImageContentType,
  POST_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES,
} from '@nadoharu/shared';

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

    if (input.fileSize > POST_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES) {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_FILE_SIZE_EXCEEDED,
        '파일 크기는 5MB를 초과할 수 없습니다.',
      );
    }

    const normalizedContentType = normalizePostImageContentType(
      input.contentType,
    );
    if (!normalizedContentType) {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_CONTENT_TYPE_NOT_ALLOWED,
        '허용되지 않은 이미지 포맷입니다.',
      );
    }

    return await this.postImageUploadService.issueUploadUrl({
      userId: input.userId,
      contentType: normalizedContentType,
      fileSize: input.fileSize,
    });
  }
}
