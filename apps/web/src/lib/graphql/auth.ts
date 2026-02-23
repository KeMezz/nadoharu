import { graphqlClient } from './client';
import {
  CREATE_USER_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
} from './auth.operations';
import type {
  AuthPayload,
  CreateUserInput,
  GraphQLResponse,
  LoginInput,
  User,
} from './types';

export function login(
  input: LoginInput,
): Promise<GraphQLResponse<{ login: AuthPayload }>> {
  return graphqlClient(LOGIN_MUTATION, { input });
}

export function createUser(
  input: CreateUserInput,
): Promise<GraphQLResponse<{ createUser: User }>> {
  return graphqlClient(CREATE_USER_MUTATION, { input });
}

export function fetchMe(): Promise<GraphQLResponse<{ me: User }>> {
  return graphqlClient(ME_QUERY);
}
