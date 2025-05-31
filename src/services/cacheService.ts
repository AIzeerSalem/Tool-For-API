import { ApiRequest, ApiResponse } from '../types';

interface CacheEntry {
  response: ApiResponse;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  private generateCacheKey(request: ApiRequest): string {
    return `${request.method}:${request.url}:${JSON.stringify(request.params)}:${JSON.stringify(request.data)}`;
  }

  set(request: ApiRequest, response: ApiResponse, ttl: number = this.defaultTTL): void {
    const key = this.generateCacheKey(request);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  get(request: ApiRequest): ApiResponse | null {
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; oldestEntry: number | null; newestEntry: number | null } {
    let oldestEntry = null;
    let newestEntry = null;

    for (const entry of this.cache.values()) {
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      oldestEntry,
      newestEntry,
    };
  }
} 