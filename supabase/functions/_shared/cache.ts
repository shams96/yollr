// Shared cache utilities for Edge Functions

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  etag: string;
}

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private readonly defaultTTL: number;
  private readonly staleTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000, staleTTL: number = 10 * 60 * 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.staleTTL = staleTTL;
  }

  // Generate cache key from parameters
  generateKey(parts: (string | number | null | undefined)[]): string {
    return parts
      .filter(part => part !== null && part !== undefined)
      .map(part => String(part))
      .join(':');
  }

  // Get value from cache
  get<T>(key: string): { data: T; etag: string } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.staleTTL) {
      this.cache.delete(key);
      return null;
    }

    return { data: entry.data as T, etag: entry.etag };
  }

  // Set value in cache
  set<T>(key: string, data: T): string {
    const etag = `"${Date.now()}"`;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
    return etag;
  }

  // Check if cache entry is stale (but still valid)
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    return now - entry.timestamp > this.defaultTTL;
  }

  // Invalidate specific cache key
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  // Invalidate cache keys matching pattern
  invalidatePattern(pattern: string): number {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    let deletedCount = 0;
    for (const key of keysToDelete) {
      if (this.cache.delete(key)) deletedCount++;
    }

    return deletedCount;
  }

  // Clear all cache entries
  clear(): number {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    memoryUsage: number;
    entries: Array<{ key: string; age: number; isStale: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      isStale: now - entry.timestamp > this.defaultTTL
    }));

    // Rough memory usage estimation (very approximate)
    const memoryUsage = entries.reduce((acc, entry) => {
      return acc + entry.key.length + JSON.stringify(entry).length;
    }, 0);

    return {
      size: this.cache.size,
      memoryUsage,
      entries
    };
  }

  // Get cache headers for response
  getCacheHeaders(etag: string, isStale: boolean): Record<string, string> {
    const maxAge = Math.floor(this.defaultTTL / 1000);
    const staleWhileRevalidate = Math.floor((this.staleTTL - this.defaultTTL) / 1000);
    
    return {
      'ETag': etag,
      'Cache-Control': `public, max-age=${maxAge}${staleWhileRevalidate > 0 ? `, stale-while-revalidate=${staleWhileRevalidate}` : ''}`,
      'X-Cache': isStale ? 'STALE' : 'HIT'
    };
  }
}

// Global cache instances for different use cases
export const geoCache = new CacheManager(5 * 60 * 1000, 10 * 60 * 1000); // 5 min TTL, 10 min stale
export const feedCache = new CacheManager(30 * 1000, 5 * 60 * 1000); // 30 sec TTL, 5 min stale

// Cache invalidation triggers
export const CacheInvalidationTriggers = {
  // Invalidate campus-related caches
  campusUpdated: (campusId: string) => {
    geoCache.invalidatePattern('geo:');
    geoCache.invalidatePattern('zip:');
  },

  // Invalidate feed caches for a specific campus
  feedUpdated: (campusId: string) => {
    feedCache.invalidatePattern(`feed:${campusId}`);
  },

  // Invalidate all caches
  clearAll: () => {
    const geoCount = geoCache.clear();
    const feedCount = feedCache.clear();
    return { geoCount, feedCount };
  }
};