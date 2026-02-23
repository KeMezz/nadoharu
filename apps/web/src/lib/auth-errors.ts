const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: '아이디 또는 비밀번호를 확인해 주세요.',
  ACCOUNT_TEMPORARILY_LOCKED: '아이디 또는 비밀번호를 확인해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  ACCOUNT_ID_ALREADY_EXISTS: '이미 사용 중인 아이디입니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  INVALID_ACCOUNT_ID_LENGTH: '아이디는 3자 이상 20자 이하여야 합니다.',
  INVALID_ACCOUNT_ID_FORMAT:
    '아이디는 영문 소문자, 숫자, 언더스코어(_)만 사용할 수 있습니다.',
  INVALID_EMAIL_FORMAT: '이메일 형식이 올바르지 않습니다.',
  NAME_REQUIRED: '닉네임을 입력해 주세요.',
  NAME_TOO_LONG: '닉네임은 50자 이하여야 합니다.',
  PASSWORD_TOO_SHORT: '비밀번호는 최소 10자 이상이어야 합니다.',
  PASSWORD_TOO_LONG: '비밀번호는 최대 72자 이하여야 합니다.',
  PASSWORD_MISSING_LOWERCASE: '비밀번호는 영문 소문자를 포함해야 합니다.',
  PASSWORD_MISSING_NUMBER: '비밀번호는 숫자를 포함해야 합니다.',
  PASSWORD_MISSING_SPECIAL_CHAR: '비밀번호는 특수문자를 포함해야 합니다.',
  NETWORK_ERROR: '서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

const DEFAULT_ERROR_MESSAGE =
  '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';

export function getAuthErrorMessage(code?: string): string {
  if (!code) return DEFAULT_ERROR_MESSAGE;
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE;
}

export function isUnauthorizedError(code?: string): boolean {
  return code === 'UNAUTHORIZED';
}
