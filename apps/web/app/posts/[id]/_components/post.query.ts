import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  PostDetailQuery,
  PostDetailQueryVariables,
} from './post.generated';
import postDetailQueryDocument from './post.graphql';

export function fetchPostDetail(
  variables: PostDetailQueryVariables,
): Promise<GraphQLResponse<PostDetailQuery>> {
  return graphqlClient(postDetailQueryDocument.trim(), variables);
}
