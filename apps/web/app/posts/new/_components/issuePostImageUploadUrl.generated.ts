import * as Types from '../../../../src/lib/graphql/generated';

export type IssuePostImageUploadUrlMutationVariables = Types.Exact<{
  input: Types.IssuePostImageUploadUrlInput;
}>;


export type IssuePostImageUploadUrlMutation = { __typename?: 'Mutation', issuePostImageUploadUrl: { __typename?: 'PostImageUploadUrlPayload', uploadUrl: string, imageUrl: string, objectKey: string, expiresInSeconds: number } };
