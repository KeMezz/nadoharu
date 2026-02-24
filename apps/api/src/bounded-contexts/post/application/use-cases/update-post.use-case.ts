import { Inject, Injectable } from '@nestjs/common';
import {
  PostRepository,
  POST_REPOSITORY,
} from '../ports/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { PostError, PostErrorCode } from '../../domain/errors/post.error';
import { assertPostImageUrlsAllowed } from './validate-post-image-urls';

export interface UpdatePostInput {
  postId: string;
  userId: string;
  content?: string | null;
  subcontent?: string | null;
  category?: string | null;
  imageUrls?: string[] | null;
}

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(input: UpdatePostInput): Promise<Post> {
    const post = await this.postRepository.findById(input.postId);
    if (!post) {
      throw new PostError(
        PostErrorCode.POST_NOT_FOUND,
        '게시물을 찾을 수 없습니다.',
      );
    }

    if (post.getAuthorId() !== input.userId) {
      throw new PostError(
        PostErrorCode.POST_FORBIDDEN,
        '게시물을 수정할 권한이 없습니다.',
      );
    }

    const hasContent = hasOwn(input, 'content');
    const hasSubcontent = hasOwn(input, 'subcontent');
    const hasCategory = hasOwn(input, 'category');
    const hasImageUrls = hasOwn(input, 'imageUrls');

    const nextContent = hasContent ? (input.content ?? '') : post.getContent();
    const nextSubcontent = hasSubcontent
      ? (input.subcontent ?? null)
      : post.getSubcontent();
    const nextCategory = hasCategory
      ? (input.category ?? null)
      : post.getCategory();
    const nextImageUrls = hasImageUrls
      ? (input.imageUrls ?? [])
      : post.getImageUrls();

    assertPostImageUrlsAllowed({
      imageUrls: nextImageUrls,
      userId: input.userId,
      publicUrl: process.env.R2_PUBLIC_URL,
    });

    const updated = post.update({
      content: nextContent,
      subcontent: nextSubcontent,
      category: nextCategory,
      imageUrls: nextImageUrls,
    });

    return await this.postRepository.save(updated);
  }
}

function hasOwn(target: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}
