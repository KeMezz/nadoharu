export interface IssuePostImageUploadUrlInput {
  userId: string;
  contentType: string;
  fileSize: number;
}

export interface IssuePostImageUploadUrlOutput {
  uploadUrl: string;
  imageUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

export interface PostImageUploadService {
  issueUploadUrl(
    input: IssuePostImageUploadUrlInput,
  ): Promise<IssuePostImageUploadUrlOutput>;
}

export const POST_IMAGE_UPLOAD_SERVICE = 'POST_IMAGE_UPLOAD_SERVICE';
