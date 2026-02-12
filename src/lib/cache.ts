interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Remove all expired entries */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  get size(): number {
    return this.store.size;
  }
}

// Singleton — shared across all API routes in the same Node.js process
const globalForCache = globalThis as unknown as { memoryCache?: MemoryCache };
export const cache = globalForCache.memoryCache ?? new MemoryCache(2000);
if (process.env.NODE_ENV !== 'production') {
  globalForCache.memoryCache = cache;
}

// TTL constants (seconds) — apenas para dados do banco
export const TTL = {
  HIGHLIGHTS: 10 * 60,       // 10 min
  AVATARS: 60 * 60,          // 1 hour
  PROVIDER_SEARCH: 5 * 60,   // 5 min
  SETTINGS: 10 * 60,         // 10 min
} as const;
