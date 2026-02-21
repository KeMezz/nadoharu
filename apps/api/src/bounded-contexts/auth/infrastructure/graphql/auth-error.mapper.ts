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

function extractMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message?.trim();
  return message && message.length > 0 ? message : null;
}

export function toAuthGraphQLError(error: unknown): GraphQLError {
  if (error instanceof GraphQLError) {
    return error;
  }

  const codeFromProperty = extractCode(error);
  if (codeFromProperty && isAuthErrorCode(codeFromProperty)) {
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

  // 호환성 유지:
  // - 위 분기: code 프로퍼티가 있는 알려진 인증 에러를 처리
  // - 여기 분기: code가 없거나 허용되지 않은 unknown 에러를 message 기반으로 정규화
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
