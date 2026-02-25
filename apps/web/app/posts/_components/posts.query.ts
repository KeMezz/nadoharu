import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  PostsTimelineQuery,
  PostsTimelineQueryVariables,
} from './posts.generated';
import postsTimelineQueryDocument from './posts.graphql';

export function fetchPostsTimeline(
  variables: PostsTimelineQueryVariables,
): Promise<GraphQLResponse<PostsTimelineQuery>> {
  return graphqlClient(postsTimelineQueryDocument.trim(), variables);
}
