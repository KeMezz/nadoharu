import { Post } from '../../domain/entities/post.entity';

export interface PostTimelineCursor {
  createdAt: Date;
  id: string;
}

export interface FindTimelineParams {
  first: number;
  after: PostTimelineCursor | null;
}

export interface FindTimelineResult {
  posts: Post[];
  hasNextPage: boolean;
}

export interface PostRepository {
  save(post: Post): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findTimeline(params: FindTimelineParams): Promise<FindTimelineResult>;
}

export const POST_REPOSITORY = 'POST_REPOSITORY';
