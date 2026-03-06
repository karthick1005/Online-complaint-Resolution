/**
 * In-Memory Cache Client
 * 
 * Simple in-memory caching without Redis dependency.
 * For caching frequently accessed data:
 * - Dashboard statistics
 * - Department lists
 * - Category lists
 * - User permissions
 */
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Get value from cache
   */
  get(key) {
    const item = this.cache.get(key);
    if (item && item.expiresAt > Date.now()) {
      return item.value;
    }
    // Expired or not found
    this.cache.delete(key);
    return null;
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  set(key, value, ttl = 300) {
    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiresAt });

    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set auto-delete timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Delete single key
   */
  del(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * Get keys matching pattern (simple wildcard support)
   */
  keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  /**
   * Flush all cache
   */
  flushdb() {
    this.cache.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
        this.isConnected = false;
        logger.error('Redis client error:', err);
      });

      this.client.on('end', () => {
        this.isConnected = false;
        logger.info('Redis client disconnected');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Application can still work without Redis (graceful degradation)
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttlSeconds = 300) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Disconnect
   */
  async disconnect() {
    if (this.client) {
  }
}

// Create and export singleton instance
const cache = new InMemoryCache();

module.exports = cache;

  keys = {
    dashboardStats: (userId, role) => `stats:dashboard:${role}:${userId}`,
    departments: () => 'data:departments',
    categories: () => 'data:categories',
    staff: (departmentId) => `data:staff:${departmentId || 'all'}`,
    complaintList: (filters) => `complaints:list:${JSON.stringify(filters)}`,
    complaint: (id) => `complaint:${id}`,
    userPermissions: (userId) => `user:permissions:${userId}`,
  };

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet(key, fetcher, ttl = 300) {
    // Try to get from cache
    let data = await this.redis.get(key);

    if (data !== null) {
      return data;
    }

    // Fetch from source
    data = await fetcher();

    // Cache for future requests
    await this.redis.set(key, data, ttl);

    return data;
  }

  /**
   * Invalidate related caches
   */
  async invalidateDashboard() {
    await this.redis.delPattern('stats:dashboard:*');
  }

  async invalidateComplaints() {
    await this.redis.delPattern('complaints:*');
  }

  async invalidateComplaint(id) {
    await this.redis.del(this.keys.complaint(id));
    await this.invalidateComplaints();
  }
}

// Singleton instances
const redisClient = new RedisClient();
const cacheService = new CacheService(redisClient);

module.exports = {
  redisClient,
  cacheService,
  RedisClient,
  CacheService,
};
