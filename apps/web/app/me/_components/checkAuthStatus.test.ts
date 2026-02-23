import { checkAuthStatus } from './checkAuthStatus';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchMe = vi.fn();

vi.mock('./me.query', () => ({
  fetchMe: () => mockFetchMe(),
}));

describe('checkAuthStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('me 조회 성공 시 사용자 정보를 반환한다', async () => {
    const user = {
      id: '1',
      accountId: 'testuser',
      email: 'test@example.com',
      name: 'Test',
    };
    mockFetchMe.mockResolvedValue({ data: { me: user } });

    const result = await checkAuthStatus();

    expect(result).toEqual({ authenticated: true, user });
  });

  it('me 조회 실패 시 비인증 상태를 반환한다', async () => {
    mockFetchMe.mockResolvedValue({
      errors: [
        { message: 'UNAUTHORIZED', extensions: { code: 'UNAUTHORIZED' } },
      ],
    });

    const result = await checkAuthStatus();

    expect(result).toEqual({ authenticated: false, user: null });
  });

  it('네트워크 오류 시 비인증 상태를 반환한다', async () => {
    mockFetchMe.mockRejectedValue(new Error('Network error'));

    const result = await checkAuthStatus();

    expect(result).toEqual({ authenticated: false, user: null });
  });

  it('localStorage나 sessionStorage에 토큰을 저장하지 않는다', async () => {
    const user = {
      id: '1',
      accountId: 'testuser',
      email: 'test@example.com',
      name: 'Test',
    };
    mockFetchMe.mockResolvedValue({ data: { me: user } });

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    await checkAuthStatus();

    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});
