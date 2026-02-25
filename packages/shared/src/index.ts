export const POST_IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const POST_IMAGE_UPLOAD_MAX_IMAGE_COUNT = 4;

export const POST_IMAGE_UPLOAD_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
] as const;

export type PostImageUploadAllowedMimeType =
  (typeof POST_IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number];

const POST_IMAGE_UPLOAD_ALLOWED_SET = new Set<string>(
  POST_IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
);

export function normalizePostImageContentType(
  contentType: string,
): PostImageUploadAllowedMimeType | null {
  const normalized = contentType.trim().toLowerCase();
  const mimeType = normalized.split(';')[0]?.trim() ?? '';

  if (!mimeType.startsWith('image/')) {
    return null;
  }

  return POST_IMAGE_UPLOAD_ALLOWED_SET.has(mimeType)
    ? (mimeType as PostImageUploadAllowedMimeType)
    : null;
}

export function isAllowedPostImageContentType(contentType: string): boolean {
  return normalizePostImageContentType(contentType) !== null;
}
