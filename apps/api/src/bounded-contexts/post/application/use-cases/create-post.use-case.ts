import { Inject, Injectable } from '@nestjs/common';
import {
  PostRepository,
  POST_REPOSITORY,
} from '../ports/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { assertPostImageUrlsAllowed } from './validate-post-image-urls';

export interface CreatePostInput {
  authorId: string;
  content?: string | null;
  subcontent?: string | null;
  category?: string | null;
  imageUrls?: string[] | null;
}

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const imageUrls = input.imageUrls ?? [];

    assertPostImageUrlsAllowed({
      imageUrls,
      userId: input.authorId,
      publicUrl: process.env.R2_PUBLIC_URL,
    });

    const post = Post.create({
      authorId: input.authorId,
      content: input.content ?? '',
      subcontent: input.subcontent,
      category: input.category,
      imageUrls,
    });

    return await this.postRepository.save(post);
  }
}
