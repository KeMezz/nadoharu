import * as Types from '../../../src/lib/graphql/generated';

export type PostsTimelineQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type PostsTimelineQuery = { __typename?: 'Query', posts: { __typename?: 'PostConnection', edges: Array<{ __typename?: 'PostEdge', cursor: string, node: { __typename?: 'Post', id: string, content: string, subcontent?: string | null, category?: string | null, imageUrls: Array<string>, authorId: string, createdAt: string, updatedAt: string } }>, pageInfo: { __typename?: 'PostPageInfo', hasNextPage: boolean, endCursor?: string | null } } };
