import { GraphQLError } from 'graphql';

const ALLOWED_CODES = new Set([
  'ACCOUNT_ID_ALREADY_EXISTS',
  'EMAIL_ALREADY_EXISTS',
  'INVALID_CREDENTIALS',
  'ACCOUNT_TEMPORARILY_LOCKED',
  'UNAUTHORIZED',
  'PASSWORD_TOO_SHORT',
  'PASSWORD_TOO_LONG',
  'PASSWORD_MISSING_LOWERCASE',
  'PASSWORD_MISSING_NUMBER',
  'PASSWORD_MISSING_SPECIAL_CHAR',
  'INVALID_ACCOUNT_ID_LENGTH',
  'INVALID_ACCOUNT_ID_FORMAT',
  'INVALID_EMAIL_FORMAT',
  'NAME_REQUIRED',
  'NAME_TOO_LONG',
]);

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
  if (codeFromProperty && ALLOWED_CODES.has(codeFromProperty)) {
    return new GraphQLError(codeFromProperty, {
      extensions: {
        code: codeFromProperty,
      },
    });
  }

  const message =
    error instanceof Error ? error.message : 'INTERNAL_SERVER_ERROR';
  const code = ALLOWED_CODES.has(message) ? message : 'INTERNAL_SERVER_ERROR';

  return new GraphQLError(code, {
    extensions: {
      code,
    },
  });
}
