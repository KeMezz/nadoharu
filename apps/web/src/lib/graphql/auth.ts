import { graphqlClient } from './client';
import authDocuments from './auth.graphql';
import type {
  AuthPayload,
  CreateUserInput,
  GraphQLResponse,
  LoginInput,
  User,
} from './types';

function readOperationDocument(marker: string): string {
  const markerToken = `# -- ${marker} --`;
  const markerStart = authDocuments.indexOf(markerToken);

  if (markerStart === -1) {
    throw new Error(`GraphQL marker not found: ${marker}`);
  }

  const contentStart = markerStart + markerToken.length;
  const nextMarkerStart = authDocuments.indexOf('# -- ', contentStart);
  const contentEnd =
    nextMarkerStart === -1 ? authDocuments.length : nextMarkerStart;

  return authDocuments.slice(contentStart, contentEnd).trim();
}

const LOGIN_MUTATION = readOperationDocument('LOGIN_MUTATION');
const CREATE_USER_MUTATION = readOperationDocument('CREATE_USER_MUTATION');
const ME_QUERY = readOperationDocument('ME_QUERY');

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
