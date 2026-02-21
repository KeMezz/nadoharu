import { AccountTemporarilyLockedError } from '../../domain/errors/auth.error';
import { InMemoryLoginRateLimitStore } from './in-memory-login-rate-limit.store';
import { LoginRateLimitService } from './login-rate-limit.service';
import { LoginRateLimitStore, RateLimitEntry } from './login-rate-limit.store';

class SnapshotLoginRateLimitStore implements LoginRateLimitStore {
  private readonly storage = new Map<string, RateLimitEntry>();

  get(key: string): RateLimitEntry | undefined {
    const entry = this.storage.get(key);
    return entry ? this.snapshot(entry) : undefined;
  }

  set(key: string, entry: RateLimitEntry): void {
    this.storage.set(key, this.snapshot(entry));
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  entries(): IterableIterator<[string, RateLimitEntry]> {
    const snapshots = Array.from(
      this.storage.entries(),
      ([key, entry]) => [key, this.snapshot(entry)] as [string, RateLimitEntry],
    );

    return snapshots[Symbol.iterator]();
  }

  private snapshot(entry: RateLimitEntry): RateLimitEntry {
    return Object.freeze({
      failureTimestamps: [...entry.failureTimestamps],
      lockedUntil: entry.lockedUntil,
    }) as RateLimitEntry;
  }
}

describe('LoginRateLimitService', () => {
  let service: LoginRateLimitService;
  let store: InMemoryLoginRateLimitStore;
  let nowSpy: jest.SpiedFunction<typeof Date.now>;
  let now = 1700000000000;

  beforeEach(() => {
    store = new InMemoryLoginRateLimitStore();
    service = new LoginRateLimitService(store);
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

    expect(store.get(staleKey)).toBeDefined();

    now += 6 * 60 * 1000;
    service.recordFailure('fresh-user', '127.0.0.2');

    expect(store.get(staleKey)).toBeUndefined();
  });

  it('store가 불변 스냅샷을 반환해도 실패 기록과 잠금 해제가 동작한다', () => {
    const snapshotStore = new SnapshotLoginRateLimitStore();
    service = new LoginRateLimitService(snapshotStore);

    for (let index = 0; index < 10; index += 1) {
      const result = service.recordFailure('testuser', '127.0.0.1');
      if (index < 9) {
        expect(result.locked).toBe(false);
      }
      now += 1000;
    }

    expect(service.isLocked('testuser', '127.0.0.1')).toBe(true);

    now += 10 * 60 * 1000 + 1;

    expect(service.isLocked('testuser', '127.0.0.1')).toBe(false);
  });

  it('잠금 만료 시 실패 이력이 남아있으면 잠금만 해제하고 엔트리를 유지한다', () => {
    // cleanup 트리거 간격(60초)을 넘기기 위해 사전 호출로 기준 시각을 초기화한다.
    service.recordFailure('warmup-user', '127.0.0.9');

    const key = service.createKey('testuser', '127.0.0.1');
    store.set(key, {
      failureTimestamps: [now - 1000],
      lockedUntil: now - 1,
    });

    expect(service.isLocked('testuser', '127.0.0.1')).toBe(false);

    const entry = store.get(key);
    expect(entry).toBeDefined();
    expect(entry?.lockedUntil).toBeNull();
    expect(entry?.failureTimestamps).toEqual([now - 1000]);
  });

  it('잠금 만료 시 실패 이력이 없으면 엔트리를 삭제한다', () => {
    // 이전 테스트와 동일하게 cleanup 기준 시각을 명시적으로 설정한다.
    // cleanup 간격(60초)을 넘기기 위한 warmup 호출로 정리 로직 실행 조건을 만든다.
    service.recordFailure('warmup-user', '127.0.0.9');

    const key = service.createKey('expired-user', '127.0.0.8');
    store.set(key, {
      failureTimestamps: [],
      lockedUntil: now - 1,
    });

    expect(service.isLocked('expired-user', '127.0.0.8')).toBe(false);
    expect(store.get(key)).toBeUndefined();
  });

  it('cleanup 시 유효한 엔트리는 필터링 후 유지한다', () => {
    const key = service.createKey('keep-user', '127.0.0.3');
    store.set(key, {
      failureTimestamps: [now - 10 * 60 * 1000, now - 1000],
      lockedUntil: now + 2 * 60 * 1000,
    });

    service.recordFailure('warmup-user', '127.0.0.9');

    now += 61 * 1000;
    service.recordFailure('trigger-cleanup', '127.0.0.4');

    const entry = store.get(key);
    expect(entry).toBeDefined();
    expect(entry?.failureTimestamps).toHaveLength(1);
    expect(entry?.lockedUntil).toBeGreaterThan(now);
  });
});
