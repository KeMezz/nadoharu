import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  EditIssuePostImageUploadUrlMutation,
  EditIssuePostImageUploadUrlMutationVariables,
} from './issuePostImageUploadUrl.generated';
import issuePostImageUploadUrlMutationDocument from './issuePostImageUploadUrl.graphql';

export function issuePostImageUploadUrlForEdit(
  input: EditIssuePostImageUploadUrlMutationVariables['input'],
): Promise<GraphQLResponse<EditIssuePostImageUploadUrlMutation>> {
  return graphqlClient(issuePostImageUploadUrlMutationDocument.trim(), {
    input,
  });
}
