export interface PostImageUrlPolicy {
  getPublicUrl(): string | undefined;
}

export const POST_IMAGE_URL_POLICY = 'POST_IMAGE_URL_POLICY';
