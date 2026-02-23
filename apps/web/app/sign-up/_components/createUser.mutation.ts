import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type {
  CreateUserMutation,
  CreateUserMutationVariables,
} from './createUser.generated';
import createUserMutationDocument from './createUser.graphql';

export function createUser(
  input: CreateUserMutationVariables['input'],
): Promise<GraphQLResponse<CreateUserMutation>> {
  return graphqlClient(createUserMutationDocument.trim(), { input });
}
