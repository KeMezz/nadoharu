import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  IssuePostImageUploadUrlMutation,
  IssuePostImageUploadUrlMutationVariables,
} from './issuePostImageUploadUrl.generated';
import issuePostImageUploadUrlMutationDocument from './issuePostImageUploadUrl.graphql';

export function issuePostImageUploadUrl(
  input: IssuePostImageUploadUrlMutationVariables['input'],
): Promise<GraphQLResponse<IssuePostImageUploadUrlMutation>> {
  return graphqlClient(issuePostImageUploadUrlMutationDocument.trim(), {
    input,
  });
}
