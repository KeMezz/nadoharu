import { graphqlClient, type GraphQLResponse } from './client';
import authDocuments from './auth.graphql';
import type {
  CreateUserMutation,
  CreateUserMutationVariables,
  LoginMutation,
  LoginMutationVariables,
  MeQuery,
} from './generated';

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
  input: LoginMutationVariables['input'],
): Promise<GraphQLResponse<LoginMutation>> {
  return graphqlClient(LOGIN_MUTATION, { input });
}

export function createUser(
  input: CreateUserMutationVariables['input'],
): Promise<GraphQLResponse<CreateUserMutation>> {
  return graphqlClient(CREATE_USER_MUTATION, { input });
}

export function fetchMe(): Promise<GraphQLResponse<MeQuery>> {
  return graphqlClient(ME_QUERY);
}
