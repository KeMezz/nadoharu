import { Inject, Injectable } from '@nestjs/common';
import {
  PostRepository,
  POST_REPOSITORY,
} from '../ports/post.repository.interface';
import { PostError, PostErrorCode } from '../../domain/errors/post.error';

export interface DeletePostInput {
  postId: string;
  userId: string;
}

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(input: DeletePostInput): Promise<boolean> {
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
        '게시물을 삭제할 권한이 없습니다.',
      );
    }

    await this.postRepository.save(post.markDeleted());
    return true;
  }
}
