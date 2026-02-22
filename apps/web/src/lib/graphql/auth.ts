import { graphqlClient } from './client';
import type {
  AuthPayload,
  CreateUserInput,
  GraphQLResponse,
  LoginInput,
  User,
} from './types';

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        accountId
        email
        name
      }
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      accountId
      email
      name
      createdAt
    }
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      accountId
      email
      name
    }
  }
`;

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
