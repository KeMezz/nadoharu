import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  EditPostQuery,
  EditPostQueryVariables,
} from './editPost.generated';
import editPostQueryDocument from './editPost.graphql';

export function fetchEditPost(
  variables: EditPostQueryVariables,
): Promise<GraphQLResponse<EditPostQuery>> {
  return graphqlClient(editPostQueryDocument.trim(), variables);
}
