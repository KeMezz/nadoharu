import { Inject, Injectable } from '@nestjs/common';
import { AccountTemporarilyLockedError } from '../../domain/errors/auth.error';
import {
  LOGIN_RATE_LIMIT_STORE,
  LoginRateLimitStore,
} from './login-rate-limit.store';

@Injectable()
export class LoginRateLimitService {
  private static readonly WINDOW_MS = 5 * 60 * 1000;
  private static readonly MAX_FAILURES = 10;
  private static readonly LOCK_DURATION_MS = 10 * 60 * 1000;
  private static readonly CLEANUP_INTERVAL_MS = 60 * 1000;

  private lastCleanupAt = 0;

  constructor(
    @Inject(LOGIN_RATE_LIMIT_STORE)
    private readonly store: LoginRateLimitStore,
  ) {}

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
    this.cleanup(now);

    const key = this.createKey(accountId, ip);
    const entry = this.store.get(key);

    if (!entry || !entry.lockedUntil) {
      return false;
    }

    if (entry.lockedUntil <= now) {
      const unlockedEntry = {
        failureTimestamps: [...entry.failureTimestamps],
        lockedUntil: null,
      };

      if (unlockedEntry.failureTimestamps.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, unlockedEntry);
      }

      return false;
    }

    return true;
  }

  recordFailure(accountId: string, ip: string): { locked: boolean } {
    const now = Date.now();
    this.cleanup(now);

    const key = this.createKey(accountId, ip);
    const existingEntry = this.store.get(key) ?? {
      failureTimestamps: [],
      lockedUntil: null,
    };

    const recentFailures = existingEntry.failureTimestamps.filter(
      (timestamp) => now - timestamp <= LoginRateLimitService.WINDOW_MS,
    );
    const nextFailureTimestamps = [...recentFailures, now];

    if (nextFailureTimestamps.length >= LoginRateLimitService.MAX_FAILURES) {
      this.store.set(key, {
        failureTimestamps: [],
        lockedUntil: now + LoginRateLimitService.LOCK_DURATION_MS,
      });
      return { locked: true };
    }

    this.store.set(key, {
      failureTimestamps: nextFailureTimestamps,
      lockedUntil: existingEntry.lockedUntil,
    });
    return { locked: false };
  }

  reset(accountId: string, ip: string): void {
    const key = this.createKey(accountId, ip);
    this.store.delete(key);
  }

  private cleanup(now: number): void {
    if (now - this.lastCleanupAt < LoginRateLimitService.CLEANUP_INTERVAL_MS) {
      return;
    }

    for (const [key, entry] of this.store.entries()) {
      const failureTimestamps = entry.failureTimestamps.filter(
        (timestamp) => now - timestamp <= LoginRateLimitService.WINDOW_MS,
      );
      const lockedUntil =
        entry.lockedUntil !== null && entry.lockedUntil <= now
          ? null
          : entry.lockedUntil;

      if (lockedUntil === null && failureTimestamps.length === 0) {
        this.store.delete(key);
        continue;
      }

      this.store.set(key, {
        failureTimestamps,
        lockedUntil,
      });
    }

    this.lastCleanupAt = now;
  }
}
