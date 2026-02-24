import { GraphQLError } from 'graphql';
import { isPostErrorCode, PostErrorCode } from './post-error-code.enum';

function extractCode(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const maybeCode = (error as Error & { code?: unknown }).code;
  return typeof maybeCode === 'string' ? maybeCode : null;
}

function extractMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message.trim();
  return message.length > 0 ? message : null;
}

export function toPostGraphQLError(error: unknown): GraphQLError {
  if (error instanceof GraphQLError) {
    return error;
  }

  const codeFromProperty = extractCode(error);
  if (codeFromProperty && isPostErrorCode(codeFromProperty)) {
    const explicitMessage = extractMessage(error);
    const message =
      explicitMessage && explicitMessage !== codeFromProperty
        ? explicitMessage
        : codeFromProperty;

    return new GraphQLError(message, {
      extensions: {
        code: codeFromProperty,
      },
    });
  }

  const message = error instanceof Error ? error.message : '';
  const code = isPostErrorCode(message)
    ? message
    : PostErrorCode.INTERNAL_SERVER_ERROR;

  return new GraphQLError(code, {
    extensions: {
      code,
    },
  });
}
