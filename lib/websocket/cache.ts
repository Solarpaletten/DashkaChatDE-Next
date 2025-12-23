/**
 * Translation Cache
 * Simple in-memory cache for translations
 */

const logger = require('./logger');

const CACHE_MAX_SIZE = 500;

class TranslationCache {
  private cache: Map<string, any>;
  private maxSize: number;

  constructor(maxSize: number = CACHE_MAX_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  generateKey(text: string, sourceCode: string, targetCode: string): string {
    return `${text.trim()}_${sourceCode}_${targetCode}`;
  }

  get(text: string, sourceCode: string, targetCode: string): any | null {
    const key = this.generateKey(text, sourceCode, targetCode);
    if (this.cache.has(key)) {
      logger.debug(`Cache hit: ${key.substring(0, 50)}`);
      return this.cache.get(key);
    }
    return null;
  }

  set(text: string, sourceCode: string, targetCode: string, value: any): void {
    const key = this.generateKey(text, sourceCode, targetCode);
    
    // Evict oldest if full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        logger.debug(`Cache eviction: ${firstKey.substring(0, 50)}`);
      }
    }
    
    this.cache.set(key, value);
    logger.debug(`Cache set: ${key.substring(0, 50)}`);
  }

  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  getSize(): number {
    return this.cache.size;
  }
}

const cache = new TranslationCache();

module.exports = cache;
export default cache;
