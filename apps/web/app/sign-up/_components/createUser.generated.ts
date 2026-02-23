import * as Types from '../../../src/lib/graphql/generated';

export type CreateUserMutationVariables = Types.Exact<{
  input: Types.CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, accountId: string, email: string, name: string, createdAt: string } };
