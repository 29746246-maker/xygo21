interface CacheEntry {
  key: string;
  value: string;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

export class PromptCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100;
  private ttl: number = 3600000;

  constructor(maxSize: number = 100, ttl: number = 3600000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, value: string): void {
    this.cleanup();

    const entry: CacheEntry = {
      key,
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0
    };

    this.cache.set(key, entry);

    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  get(key: string): string | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (Date.now() - entry.createdAt > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    entry.lastAccessed = Date.now();
    entry.accessCount++;

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() - entry.createdAt > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): {
    totalEntries: number;
    totalAccesses: number;
    hitRate: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    let totalAccesses = 0;
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;

    this.cache.forEach(entry => {
      totalAccesses += entry.accessCount;
      const entryDate = new Date(entry.createdAt);
      
      if (!oldestEntry || entryDate < oldestEntry) {
        oldestEntry = entryDate;
      }
      if (!newestEntry || entryDate > newestEntry) {
        newestEntry = entryDate;
      }
    });

    return {
      totalEntries: this.cache.size,
      totalAccesses,
      hitRate: this.cache.size > 0 ? 1 : 0,
      oldestEntry,
      newestEntry
    };
  }

  private cleanup(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.createdAt > this.ttl) {
        this.cache.delete(key);
      }
    });
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime: number = Infinity;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
