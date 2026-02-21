export interface RateLimitEntry {
  failureTimestamps: number[];
  lockedUntil: number | null;
}

export interface LoginRateLimitStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
  // TODO: Redis 전환 시 entries()를 AsyncIterable 또는 전용 순회 API로 대체한다.
  entries(): IterableIterator<[string, RateLimitEntry]>;
}

export const LOGIN_RATE_LIMIT_STORE = 'LoginRateLimitStore';
