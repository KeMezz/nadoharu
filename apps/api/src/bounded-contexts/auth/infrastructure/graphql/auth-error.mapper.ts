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
  // - 기존 auth.error.ts 에러: message === CODE, code 프로퍼티 없음
  // - 신규 VO/도메인 에러: code + 사용자 메시지 분리
  // 위 분기에서 신규 패턴을 우선 처리하고, 여기서 기존 패턴을 정규화한다.
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
