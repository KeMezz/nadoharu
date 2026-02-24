import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IssuePostImageUploadUrlInput,
  IssuePostImageUploadUrlOutput,
  PostImageUploadService,
} from '../../application/ports/post-image-upload.service.interface';
import { PostError, PostErrorCode } from '../../domain/errors/post.error';

interface R2Config {
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

@Injectable()
export class R2PostImageUploadService implements PostImageUploadService {
  private readonly expiresInSeconds = 300;
  private readonly config: R2Config;
  private readonly client: S3Client;

  constructor() {
    this.config = this.resolveConfig();
    this.client = new S3Client({
      endpoint: this.config.endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async issueUploadUrl(
    input: IssuePostImageUploadUrlInput,
  ): Promise<IssuePostImageUploadUrlOutput> {
    const extension = resolveFileExtension(input.contentType);
    const objectKey = `users/${input.userId}/posts/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: objectKey,
      ContentType: input.contentType,
      ContentLength: input.fileSize,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.expiresInSeconds,
    });

    return {
      uploadUrl,
      objectKey,
      imageUrl: `${this.config.publicUrl}/${objectKey}`,
      expiresInSeconds: this.expiresInSeconds,
    };
  }

  private resolveConfig(): R2Config {
    const endpoint = process.env.R2_ENDPOINT;
    const bucketName = process.env.R2_BUCKET_NAME;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (
      !endpoint ||
      !bucketName ||
      !accessKeyId ||
      !secretAccessKey ||
      !publicUrl
    ) {
      throw new PostError(
        PostErrorCode.POST_UPLOAD_NOT_CONFIGURED,
        '이미지 업로드 설정이 누락되었습니다.',
      );
    }

    return {
      endpoint,
      bucketName,
      accessKeyId,
      secretAccessKey,
      publicUrl: publicUrl.replace(/\/$/, ''),
    };
  }
}

function resolveFileExtension(contentType: string): string {
  const normalized = contentType.trim().toLowerCase();
  if (!normalized.includes('/')) {
    return normalized;
  }

  return normalized.split('/').at(-1) ?? 'bin';
}
