import * as Types from '../../../../src/lib/graphql/generated';

export type CreatePostMutationVariables = Types.Exact<{
  input: Types.CreatePostInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', id: string, content: string, subcontent?: string | null, category?: string | null, imageUrls: Array<string>, authorId: string, createdAt: string, updatedAt: string } };
