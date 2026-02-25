import * as Types from '../../../../../src/lib/graphql/generated';

export type EditIssuePostImageUploadUrlMutationVariables = Types.Exact<{
  input: Types.IssuePostImageUploadUrlInput;
}>;


export type EditIssuePostImageUploadUrlMutation = { __typename?: 'Mutation', issuePostImageUploadUrl: { __typename?: 'PostImageUploadUrlPayload', uploadUrl: string, imageUrl: string, objectKey: string, expiresInSeconds: number } };
