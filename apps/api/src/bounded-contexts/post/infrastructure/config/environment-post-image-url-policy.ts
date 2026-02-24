import { Injectable } from '@nestjs/common';
import { PostImageUrlPolicy } from '../../application/ports/post-image-url-policy.interface';

@Injectable()
export class EnvironmentPostImageUrlPolicy implements PostImageUrlPolicy {
  private readonly publicUrl: string | undefined;

  constructor() {
    const value = process.env.R2_PUBLIC_URL?.trim();
    this.publicUrl = value && value.length > 0 ? value : undefined;
  }

  getPublicUrl(): string | undefined {
    return this.publicUrl;
  }
}
