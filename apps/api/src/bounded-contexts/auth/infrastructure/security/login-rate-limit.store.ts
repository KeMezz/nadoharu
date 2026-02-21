export interface RateLimitEntry {
  failureTimestamps: number[];
  lockedUntil: number | null;
}

export interface LoginRateLimitStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
  entries(): IterableIterator<[string, RateLimitEntry]>;
}

export const LOGIN_RATE_LIMIT_STORE = 'LoginRateLimitStore';
