import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type { LoginMutation, LoginMutationVariables } from './login.generated';
import loginMutationDocument from './login.graphql';

export function login(
  input: LoginMutationVariables['input'],
): Promise<GraphQLResponse<LoginMutation>> {
  return graphqlClient(loginMutationDocument.trim(), { input });
}
