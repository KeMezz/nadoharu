import { GraphQLError } from 'graphql';
import {
  AccountIdError,
  AccountIdErrorCode,
} from '../../domain/errors/account-id.error';
import {
  PasswordError,
  PasswordErrorCode,
} from '../../domain/errors/password.error';
import { NameError, NameErrorCode } from '../../domain/errors/name.error';
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

  it('message가 일반 문구여도 error.code가 허용 코드면 해당 코드로 변환한다', () => {
    const result = toAuthGraphQLError(
      new AccountIdError(
        AccountIdErrorCode.INVALID_ACCOUNT_ID_FORMAT,
        '계정 ID 형식이 잘못되었습니다.',
      ),
    );

    expect(result.message).toBe('계정 ID 형식이 잘못되었습니다.');
    expect(result.extensions.code).toBe('INVALID_ACCOUNT_ID_FORMAT');
  });

  it('비밀번호 정책 에러는 코드와 사용자 메시지를 함께 보존한다', () => {
    const result = toAuthGraphQLError(
      new PasswordError(
        PasswordErrorCode.PASSWORD_TOO_SHORT,
        '비밀번호는 최소 10자 이상이어야 합니다.',
      ),
    );

    expect(result.message).toBe('비밀번호는 최소 10자 이상이어야 합니다.');
    expect(result.extensions.code).toBe('PASSWORD_TOO_SHORT');
  });

  it('이름 검증 에러는 코드와 사용자 메시지를 함께 보존한다', () => {
    const result = toAuthGraphQLError(
      new NameError(NameErrorCode.NAME_REQUIRED, '이름은 필수 입력 값입니다.'),
    );

    expect(result.message).toBe('이름은 필수 입력 값입니다.');
    expect(result.extensions.code).toBe('NAME_REQUIRED');
  });
});
