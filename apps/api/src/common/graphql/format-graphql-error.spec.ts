import { GraphQLFormattedError } from 'graphql';
import { formatGraphQLError } from './format-graphql-error';

describe('formatGraphQLError', () => {
  it('이미 허용된 code가 있으면 그대로 유지한다', () => {
    const error: GraphQLFormattedError = {
      message: '계정이 이미 존재합니다',
      extensions: {
        code: 'ACCOUNT_ID_ALREADY_EXISTS',
      },
    };

    const formatted = formatGraphQLError(error);
    expect(formatted.extensions?.code).toBe('ACCOUNT_ID_ALREADY_EXISTS');
  });

  it('message가 에러 코드면 extensions.code에 매핑한다', () => {
    const error: GraphQLFormattedError = {
      message: 'INVALID_CREDENTIALS',
      extensions: {},
    };

    const formatted = formatGraphQLError(error);
    expect(formatted.extensions?.code).toBe('INVALID_CREDENTIALS');
  });

  it('알 수 없는 에러는 INTERNAL_SERVER_ERROR로 매핑한다', () => {
    const error: GraphQLFormattedError = {
      message: 'Unexpected error',
      extensions: {},
    };

    const formatted = formatGraphQLError(error);
    expect(formatted.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
