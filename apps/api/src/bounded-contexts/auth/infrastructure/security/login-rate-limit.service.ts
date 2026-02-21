import { Injectable } from '@nestjs/common';
import { AccountTemporarilyLockedError } from '../../domain/errors/auth.error';

interface RateLimitEntry {
  failureTimestamps: number[];
  lockedUntil: number | null;
}

@Injectable()
export class LoginRateLimitService {
  private static readonly WINDOW_MS = 5 * 60 * 1000;
  private static readonly MAX_FAILURES = 10;
  private static readonly LOCK_DURATION_MS = 10 * 60 * 1000;

  private readonly storage = new Map<string, RateLimitEntry>();

  createKey(accountId: string, ip: string): string {
    return `ratelimit:${accountId.toLowerCase()}:${ip}`;
  }

  assertNotLocked(accountId: string, ip: string): void {
    if (this.isLocked(accountId, ip)) {
      throw new AccountTemporarilyLockedError();
    }
  }

  isLocked(accountId: string, ip: string): boolean {
    const now = Date.now();
    const key = this.createKey(accountId, ip);
    const entry = this.storage.get(key);

    if (!entry || !entry.lockedUntil) {
      return false;
    }

    if (entry.lockedUntil <= now) {
      entry.lockedUntil = null;
      this.storage.set(key, entry);
      return false;
    }

    return true;
  }

  recordFailure(accountId: string, ip: string): { locked: boolean } {
    const now = Date.now();
    const key = this.createKey(accountId, ip);
    const entry = this.storage.get(key) ?? {
      failureTimestamps: [],
      lockedUntil: null,
    };

    entry.failureTimestamps = entry.failureTimestamps.filter(
      (timestamp) => now - timestamp <= LoginRateLimitService.WINDOW_MS,
    );
    entry.failureTimestamps.push(now);

    if (entry.failureTimestamps.length >= LoginRateLimitService.MAX_FAILURES) {
      entry.lockedUntil = now + LoginRateLimitService.LOCK_DURATION_MS;
      entry.failureTimestamps = [];
      this.storage.set(key, entry);
      return { locked: true };
    }

    this.storage.set(key, entry);
    return { locked: false };
  }

  reset(accountId: string, ip: string): void {
    const key = this.createKey(accountId, ip);
    this.storage.delete(key);
  }
}
