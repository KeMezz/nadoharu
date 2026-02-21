import { GraphQLFormattedError } from 'graphql';
import {
  AuthErrorCode,
  isAuthErrorCode,
} from '../../bounded-contexts/auth/infrastructure/graphql/auth-error-code.enum';

export function formatGraphQLError(
  error: GraphQLFormattedError,
): GraphQLFormattedError {
  const codeFromExtensions = error.extensions?.code;
  if (
    typeof codeFromExtensions === 'string' &&
    isAuthErrorCode(codeFromExtensions)
  ) {
    return error;
  }

  const code = isAuthErrorCode(error.message)
    ? error.message
    : AuthErrorCode.INTERNAL_SERVER_ERROR;

  return {
    ...error,
    extensions: {
      ...(error.extensions ?? {}),
      code,
    },
  };
}
