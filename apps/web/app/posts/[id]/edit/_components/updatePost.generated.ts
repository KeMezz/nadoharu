import * as Types from '../../../../../src/lib/graphql/generated';

export type UpdatePostMutationVariables = Types.Exact<{
  input: Types.UpdatePostInput;
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost: { __typename?: 'Post', id: string, content: string, subcontent?: string | null, category?: string | null, imageUrls: Array<string>, authorId: string, createdAt: string, updatedAt: string } };
