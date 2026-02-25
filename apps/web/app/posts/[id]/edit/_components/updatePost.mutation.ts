import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  UpdatePostMutation,
  UpdatePostMutationVariables,
} from './updatePost.generated';
import updatePostMutationDocument from './updatePost.graphql';

export function updatePost(
  input: UpdatePostMutationVariables['input'],
): Promise<GraphQLResponse<UpdatePostMutation>> {
  return graphqlClient(updatePostMutationDocument.trim(), { input });
}
