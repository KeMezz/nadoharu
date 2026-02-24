import { Inject, Injectable } from '@nestjs/common';
import {
  PostRepository,
  POST_REPOSITORY,
} from '../ports/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';

export interface GetPostInput {
  postId: string;
}

@Injectable()
export class GetPostUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(input: GetPostInput): Promise<Post | null> {
    return await this.postRepository.findById(input.postId);
  }
}
