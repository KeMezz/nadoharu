export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLError[];
}

function getGraphQLUrl(): string {
  return '/api/graphql';
}

export async function graphqlClient<TData = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQLResponse<TData>> {
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

  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok && !contentType.toLowerCase().includes('application/json')) {
    return {
      errors: [
        {
          message: 'NETWORK_ERROR',
          extensions: { code: 'NETWORK_ERROR' },
        },
      ],
    };
  }

  return response.json();
}
