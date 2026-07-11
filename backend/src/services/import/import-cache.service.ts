import { ParsedCsvData, PreviewDTO } from '../../types/import.types';

interface CacheEntry {
  preview: PreviewDTO;
  parsedData: ParsedCsvData;
  timestamp: number;
}

class ImportCacheService {
  private cache = new Map<string, CacheEntry>();
  // 1 hour TTL
  private TTL = 60 * 60 * 1000;

  set(importId: string, preview: PreviewDTO, parsedData: ParsedCsvData) {
    this.cache.set(importId, {
      preview,
      parsedData,
      timestamp: Date.now(),
    });
  }

  get(importId: string): CacheEntry | undefined {
    const entry = this.cache.get(importId);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(importId);
      return undefined;
    }

    return entry;
  }

  delete(importId: string) {
    this.cache.delete(importId);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const importCacheService = new ImportCacheService();

// Run cleanup every 10 minutes
setInterval(() => importCacheService.cleanup(), 10 * 60 * 1000);
