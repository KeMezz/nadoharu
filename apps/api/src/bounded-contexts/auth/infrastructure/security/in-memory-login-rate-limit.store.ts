import { Injectable } from '@nestjs/common';
import { LoginRateLimitStore, RateLimitEntry } from './login-rate-limit.store';

@Injectable()
export class InMemoryLoginRateLimitStore implements LoginRateLimitStore {
  private readonly storage = new Map<string, RateLimitEntry>();

  get(key: string): RateLimitEntry | undefined {
    return this.storage.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.storage.set(key, entry);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  entries(): IterableIterator<[string, RateLimitEntry]> {
    return this.storage.entries();
  }
}
