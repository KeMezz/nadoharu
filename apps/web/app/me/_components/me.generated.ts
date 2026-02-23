import * as Types from '../../../src/lib/graphql/generated';

export type MeQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, accountId: string, email: string, name: string } };
