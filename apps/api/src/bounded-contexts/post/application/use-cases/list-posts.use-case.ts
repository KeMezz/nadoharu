import { Inject, Injectable } from '@nestjs/common';
import {
  FindTimelineResult,
  PostRepository,
  PostTimelineCursor,
  POST_REPOSITORY,
} from '../ports/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { PostError, PostErrorCode } from '../../domain/errors/post.error';

export interface ListPostsInput {
  first: number;
  after?: string | null;
  before?: string | null;
  last?: number | null;
}

export interface PostConnectionEdge {
  node: Post;
  cursor: string;
}

export interface PostConnectionPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ListPostsOutput {
  edges: PostConnectionEdge[];
  pageInfo: PostConnectionPageInfo;
}

@Injectable()
export class ListPostsUseCase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(input: ListPostsInput): Promise<ListPostsOutput> {
    if (input.before != null || input.last != null) {
      throw new PostError(
        PostErrorCode.UNSUPPORTED_PAGINATION_PARAM,
        'before/last 파라미터는 현재 지원하지 않습니다.',
      );
    }

    if (input.first <= 0) {
      throw new PostError(
        PostErrorCode.UNSUPPORTED_PAGINATION_PARAM,
        'first는 1 이상의 값이어야 합니다.',
      );
    }

    const timeline = await this.postRepository.findTimeline({
      first: input.first,
      after: decodeCursor(input.after),
    });

    return toConnection(timeline);
  }
}

function toConnection(timeline: FindTimelineResult): ListPostsOutput {
  const edges = timeline.posts.map((post) => ({
    node: post,
    cursor: encodeCursor({
      createdAt: post.getCreatedAt(),
      id: post.getId(),
    }),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: timeline.hasNextPage,
      endCursor: edges.at(-1)?.cursor ?? null,
    },
  };
}

function encodeCursor(cursor: PostTimelineCursor): string {
  const payload = JSON.stringify({
    createdAt: cursor.createdAt.toISOString(),
    id: cursor.id,
  });

  return Buffer.from(payload).toString('base64');
}

function decodeCursor(cursor?: string | null): PostTimelineCursor | null {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded) as {
      createdAt?: unknown;
      id?: unknown;
    };

    if (typeof parsed.createdAt !== 'string' || typeof parsed.id !== 'string') {
      throw new Error('invalid cursor payload');
    }

    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error('invalid cursor date');
    }

    return {
      createdAt,
      id: parsed.id,
    };
  } catch {
    throw new PostError(
      PostErrorCode.INVALID_PAGINATION_CURSOR,
      '유효하지 않은 커서입니다.',
    );
  }
}
