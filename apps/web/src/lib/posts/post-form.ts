import {
  normalizePostImageContentType,
  POST_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES,
  POST_IMAGE_UPLOAD_MAX_IMAGE_COUNT,
} from '@nadoharu/shared';
import type { GraphQLError } from '@/lib/graphql';

export const POST_TEXT_MAX_LENGTH = 150;

export interface PostDraft {
  content: string;
  subcontent: string;
  imageUrls: string[];
}

export function validatePostDraft(draft: PostDraft): string | null {
  const trimmedContent = draft.content.trim();
  const trimmedSubcontent = draft.subcontent.trim();

  if (!trimmedContent && draft.imageUrls.length === 0) {
    return '본문 또는 이미지를 하나 이상 입력해 주세요.';
  }

  if (trimmedContent.length > POST_TEXT_MAX_LENGTH) {
    return `본문은 ${POST_TEXT_MAX_LENGTH}자 이하여야 합니다.`;
  }

  if (trimmedSubcontent.length > POST_TEXT_MAX_LENGTH) {
    return `보조 문구는 ${POST_TEXT_MAX_LENGTH}자 이하여야 합니다.`;
  }

  return null;
}

export function extractGraphQLErrorCode(
  errors?: GraphQLError[],
): string | undefined {
  const code = errors?.[0]?.extensions?.code;
  return typeof code === 'string' ? code.toUpperCase() : undefined;
}

export function isAuthenticationErrorCode(code?: string): boolean {
  return (
    code === 'UNAUTHENTICATED' || code === 'UNAUTHORIZED' || code === '401'
  );
}

export function isAuthorizationErrorCode(code?: string): boolean {
  return code === 'FORBIDDEN' || code === 'POST_FORBIDDEN' || code === '403';
}

export interface ImageFileValidationResult {
  normalizedContentType: string;
}

export function validateImageFile(
  file: File,
):
  | { ok: true; value: ImageFileValidationResult }
  | { ok: false; error: string } {
  const normalizedContentType = normalizePostImageContentType(file.type);
  if (!normalizedContentType) {
    return {
      ok: false,
      error: '지원하지 않는 이미지 형식입니다.',
    };
  }

  if (file.size > POST_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: '이미지는 최대 5MB까지 업로드할 수 있습니다.',
    };
  }

  return {
    ok: true,
    value: {
      normalizedContentType,
    },
  };
}

export function canAddMoreImages(currentCount: number): boolean {
  return currentCount < POST_IMAGE_UPLOAD_MAX_IMAGE_COUNT;
}
