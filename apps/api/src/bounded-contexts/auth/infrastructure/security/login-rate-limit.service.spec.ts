import { AccountTemporarilyLockedError } from '../../domain/errors/auth.error';
import { LoginRateLimitService } from './login-rate-limit.service';

describe('LoginRateLimitService', () => {
  let service: LoginRateLimitService;
  let nowSpy: jest.SpiedFunction<typeof Date.now>;
  let now = 1700000000000;

  beforeEach(() => {
    service = new LoginRateLimitService();
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('accountId+IP 조합으로 rate limit 키를 생성한다', () => {
    expect(service.createKey('TestUser', '127.0.0.1')).toBe(
      'ratelimit:testuser:127.0.0.1',
    );
  });

  it('5분 내 10회 미만 실패는 잠금되지 않는다', () => {
    for (let index = 0; index < 9; index += 1) {
      const result = service.recordFailure('testuser', '127.0.0.1');
      expect(result.locked).toBe(false);
      now += 1000;
    }

    expect(service.isLocked('testuser', '127.0.0.1')).toBe(false);
  });

  it('5분 내 10회 실패 시 잠금된다', () => {
    let lastResult = { locked: false };

    for (let index = 0; index < 10; index += 1) {
      lastResult = service.recordFailure('testuser', '127.0.0.1');
      now += 1000;
    }

    expect(lastResult.locked).toBe(true);
    expect(service.isLocked('testuser', '127.0.0.1')).toBe(true);
    expect(() => service.assertNotLocked('testuser', '127.0.0.1')).toThrow(
      AccountTemporarilyLockedError,
    );
  });

  it('10분 잠금 시간이 지나면 자동 해제된다', () => {
    for (let index = 0; index < 10; index += 1) {
      service.recordFailure('testuser', '127.0.0.1');
      now += 1000;
    }

    expect(service.isLocked('testuser', '127.0.0.1')).toBe(true);

    now += 10 * 60 * 1000 + 1;

    expect(service.isLocked('testuser', '127.0.0.1')).toBe(false);
    expect(() =>
      service.assertNotLocked('testuser', '127.0.0.1'),
    ).not.toThrow();
  });

  it('로그인 성공 시 카운터를 초기화한다', () => {
    for (let index = 0; index < 3; index += 1) {
      service.recordFailure('testuser', '127.0.0.1');
      now += 1000;
    }

    service.reset('testuser', '127.0.0.1');

    const result = service.recordFailure('testuser', '127.0.0.1');
    expect(result.locked).toBe(false);
  });

  it('오래된 엔트리는 주기적 정리 시 storage에서 제거된다', () => {
    service.recordFailure('stale-user', '127.0.0.1');
    const staleKey = service.createKey('stale-user', '127.0.0.1');

    expect(
      (service as unknown as { storage: Map<string, unknown> }).storage.has(
        staleKey,
      ),
    ).toBe(true);

    now += 6 * 60 * 1000;
    service.recordFailure('fresh-user', '127.0.0.2');

    expect(
      (service as unknown as { storage: Map<string, unknown> }).storage.has(
        staleKey,
      ),
    ).toBe(false);
  });
});
