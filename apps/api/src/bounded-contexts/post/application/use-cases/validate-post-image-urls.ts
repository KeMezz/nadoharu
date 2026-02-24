import { PostError, PostErrorCode } from '../../domain/errors/post.error';

export function assertPostImageUrlsAllowed(params: {
  imageUrls: string[];
  userId: string;
  publicUrl?: string;
}): void {
  const publicBase = parsePublicBase(params.publicUrl);
  const expectedPrefix = `${publicBase?.pathPrefix ?? ''}/users/${params.userId}/posts/`;

  for (const imageUrl of params.imageUrls) {
    let parsed: URL;

    try {
      parsed = new URL(imageUrl);
    } catch {
      throw new PostError(
        PostErrorCode.POST_IMAGE_URL_NOT_ALLOWED,
        '유효한 이미지 URL만 허용됩니다.',
      );
    }

    if (publicBase && parsed.origin !== publicBase.origin) {
      throw new PostError(
        PostErrorCode.POST_IMAGE_URL_NOT_ALLOWED,
        '업로드 정책과 다른 도메인의 URL은 허용되지 않습니다.',
      );
    }

    if (!parsed.pathname.startsWith(expectedPrefix)) {
      throw new PostError(
        PostErrorCode.POST_IMAGE_URL_NOT_ALLOWED,
        '현재 사용자 prefix의 이미지 URL만 허용됩니다.',
      );
    }
  }
}

function parsePublicBase(publicUrl?: string): {
  origin: string;
  pathPrefix: string;
} | null {
  if (!publicUrl) {
    return null;
  }

  try {
    const parsed = new URL(publicUrl);
    return {
      origin: parsed.origin,
      pathPrefix: normalizePathPrefix(parsed.pathname),
    };
  } catch {
    return null;
  }
}

function normalizePathPrefix(pathname: string): string {
  const normalized = pathname.replace(/\/$/, '');

  if (!normalized || normalized === '/') {
    return '';
  }

  return normalized;
}
