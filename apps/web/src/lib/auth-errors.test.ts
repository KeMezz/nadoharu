import { getAuthErrorMessage, isUnauthorizedError } from './auth-errors';

describe('getAuthErrorMessage', () => {
  it('INVALID_CREDENTIALS에 대해 보수적 단일 문구를 반환한다', () => {
    const message = getAuthErrorMessage('INVALID_CREDENTIALS');

    expect(message).toBe('아이디 또는 비밀번호를 확인해 주세요.');
    expect(message).not.toContain('존재');
    expect(message).not.toContain('없');
  });

  it('ACCOUNT_TEMPORARILY_LOCKED에 대해 보수적 단일 문구를 반환한다', () => {
    const message = getAuthErrorMessage('ACCOUNT_TEMPORARILY_LOCKED');

    expect(message).toBe('아이디 또는 비밀번호를 확인해 주세요.');
    expect(message).not.toContain('잠금');
    expect(message).not.toContain('시간');
  });

  it('UNAUTHORIZED에 대해 로그인 유도 메시지를 반환한다', () => {
    const message = getAuthErrorMessage('UNAUTHORIZED');

    expect(message).toBe('로그인이 필요합니다.');
  });

  it('ACCOUNT_ID_ALREADY_EXISTS에 대해 안내 메시지를 반환한다', () => {
    const message = getAuthErrorMessage('ACCOUNT_ID_ALREADY_EXISTS');

    expect(message).toBe('이미 사용 중인 아이디입니다.');
  });

  it('EMAIL_ALREADY_EXISTS에 대해 안내 메시지를 반환한다', () => {
    const message = getAuthErrorMessage('EMAIL_ALREADY_EXISTS');

    expect(message).toBe('이미 사용 중인 이메일입니다.');
  });

  it.each([
    ['INVALID_ACCOUNT_ID_LENGTH', '아이디는 3자 이상 20자 이하여야 합니다.'],
    [
      'INVALID_ACCOUNT_ID_FORMAT',
      '아이디는 영문 소문자, 숫자, 언더스코어(_)만 사용할 수 있습니다.',
    ],
    ['INVALID_EMAIL_FORMAT', '이메일 형식이 올바르지 않습니다.'],
    ['NAME_REQUIRED', '닉네임을 입력해 주세요.'],
    ['NAME_TOO_LONG', '닉네임은 50자 이하여야 합니다.'],
    ['PASSWORD_TOO_SHORT', '비밀번호는 최소 10자 이상이어야 합니다.'],
    ['PASSWORD_TOO_LONG', '비밀번호는 최대 72자 이하여야 합니다.'],
    ['PASSWORD_MISSING_LOWERCASE', '비밀번호는 영문 소문자를 포함해야 합니다.'],
    ['PASSWORD_MISSING_NUMBER', '비밀번호는 숫자를 포함해야 합니다.'],
    ['PASSWORD_MISSING_SPECIAL_CHAR', '비밀번호는 특수문자를 포함해야 합니다.'],
    ['NETWORK_ERROR', '서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.'],
  ])(
    '%s에 대해 구체적인 유효성 검사 메시지를 반환한다',
    (code, expectedMessage) => {
      const message = getAuthErrorMessage(code);

      expect(message).toBe(expectedMessage);
    },
  );

  it('알 수 없는 코드에 대해 기본 메시지를 반환한다', () => {
    const message = getAuthErrorMessage('UNKNOWN_CODE');

    expect(message).toBe(
      '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    );
  });

  it('코드 없이 호출하면 기본 메시지를 반환한다', () => {
    const message = getAuthErrorMessage();

    expect(message).toBe(
      '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    );
  });
});

describe('isUnauthorizedError', () => {
  it('UNAUTHORIZED 코드를 올바르게 감지한다', () => {
    expect(isUnauthorizedError('UNAUTHORIZED')).toBe(true);
  });

  it('다른 코드에 대해 false를 반환한다', () => {
    expect(isUnauthorizedError('INVALID_CREDENTIALS')).toBe(false);
    expect(isUnauthorizedError(undefined)).toBe(false);
  });
});
