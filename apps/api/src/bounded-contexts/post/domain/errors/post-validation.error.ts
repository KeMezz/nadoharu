export const PostValidationErrorCode = {
  POST_CONTENT_TOO_LONG: 'POST_CONTENT_TOO_LONG',
  POST_SUBCONTENT_TOO_LONG: 'POST_SUBCONTENT_TOO_LONG',
  POST_IMAGE_LIMIT_EXCEEDED: 'POST_IMAGE_LIMIT_EXCEEDED',
  POST_CONTENT_OR_IMAGE_REQUIRED: 'POST_CONTENT_OR_IMAGE_REQUIRED',
} as const;

export type PostValidationErrorCodeValue =
  (typeof PostValidationErrorCode)[keyof typeof PostValidationErrorCode];

export class PostValidationError extends Error {
  constructor(
    public readonly code: PostValidationErrorCodeValue,
    message: string,
  ) {
    super(message);
    this.name = 'PostValidationError';
  }
}
