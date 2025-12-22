/**
 * Cache Utility
 * TODO: Перенести из backend/src/utils/cache.js
 */

export class Cache {
  private store = new Map<string, { value: unknown; expires: number }>();

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  set(key: string, value: unknown, ttlMs: number = 60000): void {
    this.store.set(key, { value, expires: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new Cache();
