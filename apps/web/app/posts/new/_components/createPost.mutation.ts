import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  CreatePostMutation,
  CreatePostMutationVariables,
} from './createPost.generated';
import createPostMutationDocument from './createPost.graphql';

export function createPost(
  input: CreatePostMutationVariables['input'],
): Promise<GraphQLResponse<CreatePostMutation>> {
  return graphqlClient(createPostMutationDocument.trim(), { input });
}
