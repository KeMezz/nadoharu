import type { GraphQLResponse } from './types';

function getGraphQLUrl(): string {
  return '/api/graphql';
}

export async function graphqlClient<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQLResponse<T>> {
  const body: Record<string, unknown> = { query };
  if (variables) {
    body.variables = variables;
  }

  const response = await fetch(getGraphQLUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  return response.json();
}
