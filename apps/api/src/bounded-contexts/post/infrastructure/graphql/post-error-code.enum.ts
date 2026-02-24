import { PostErrorCode as PostDomainErrorCode } from '../../domain/errors/post.error';
import { PostValidationErrorCode } from '../../domain/errors/post-validation.error';

export const PostErrorCode = {
  ...PostDomainErrorCode,
  ...PostValidationErrorCode,
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type PostErrorCode = (typeof PostErrorCode)[keyof typeof PostErrorCode];

const POST_ERROR_CODES = new Set<PostErrorCode>(Object.values(PostErrorCode));

export function isPostErrorCode(value: string): value is PostErrorCode {
  return POST_ERROR_CODES.has(value as PostErrorCode);
}
