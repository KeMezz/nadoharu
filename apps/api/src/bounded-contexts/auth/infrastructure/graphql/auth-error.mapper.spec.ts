import { GraphQLError } from 'graphql';
import { toAuthGraphQLError } from './auth-error.mapper';

describe('toAuthGraphQLError', () => {
  it('허용된 에러 코드를 GraphQL 에러로 변환한다', () => {
    const result = toAuthGraphQLError(new Error('INVALID_CREDENTIALS'));

    expect(result).toBeInstanceOf(GraphQLError);
    expect(result.message).toBe('INVALID_CREDENTIALS');
    expect(result.extensions.code).toBe('INVALID_CREDENTIALS');
  });

  it('이미 GraphQLError면 그대로 반환한다', () => {
    const gqlError = new GraphQLError('UNAUTHORIZED', {
      extensions: { code: 'UNAUTHORIZED' },
    });

    const result = toAuthGraphQLError(gqlError);
    expect(result).toBe(gqlError);
  });

  it('허용되지 않은 에러는 INTERNAL_SERVER_ERROR로 변환한다', () => {
    const result = toAuthGraphQLError(new Error('SOMETHING_WRONG'));

    expect(result.message).toBe('INTERNAL_SERVER_ERROR');
    expect(result.extensions.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
