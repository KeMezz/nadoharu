import * as Types from '../../../../src/lib/graphql/generated';

export type PostDetailQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type PostDetailQuery = { __typename?: 'Query', post?: { __typename?: 'Post', id: string, content: string, subcontent?: string | null, category?: string | null, imageUrls: Array<string>, authorId: string, createdAt: string, updatedAt: string } | null };
