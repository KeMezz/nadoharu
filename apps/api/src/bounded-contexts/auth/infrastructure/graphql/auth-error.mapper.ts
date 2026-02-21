import { GraphQLError } from 'graphql';
import { AuthErrorCode, isAuthErrorCode } from './auth-error-code.enum';

function extractCode(error: unknown): string | null {
  if (error instanceof Error) {
    const maybeCode = (error as Error & { code?: unknown }).code;
    if (typeof maybeCode === 'string') {
      return maybeCode;
    }
  }

  return null;
}

export function toAuthGraphQLError(error: unknown): GraphQLError {
  if (error instanceof GraphQLError) {
    return error;
  }

  const codeFromProperty = extractCode(error);
  if (codeFromProperty && isAuthErrorCode(codeFromProperty)) {
    return new GraphQLError(codeFromProperty, {
      extensions: {
        code: codeFromProperty,
      },
    });
  }

  const message =
    error instanceof Error
      ? error.message
      : AuthErrorCode.INTERNAL_SERVER_ERROR;
  const code = isAuthErrorCode(message)
    ? message
    : AuthErrorCode.INTERNAL_SERVER_ERROR;

  return new GraphQLError(code, {
    extensions: {
      code,
    },
  });
}
