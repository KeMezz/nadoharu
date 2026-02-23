import { graphqlClient, type GraphQLResponse } from '@/lib/graphql/client';
import type {
  CreateUserMutation,
  CreateUserMutationVariables,
} from '@/lib/graphql/generated';
import createUserMutationDocument from './createUser.graphql';

export function createUser(
  input: CreateUserMutationVariables['input'],
): Promise<GraphQLResponse<CreateUserMutation>> {
  return graphqlClient(createUserMutationDocument.trim(), { input });
}
