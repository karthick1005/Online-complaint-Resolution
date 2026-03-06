/**
 * Enhanced Cache Service
 * 
 * Provides in-memory caching with error handling and fallbacks
 */

const cache = require('./redisClient');
const { logger } = require('../utils/logger');

class CacheService {
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const data = cache.get(key);
      if (data) {
        logger.debug({ message: 'Cache hit', key });
        return data;
      }
      logger.debug({ message: 'Cache miss', key });
      return null;
    } catch (error) {
      logger.error({ message: 'Cache get error', key, error: error.message });
      return null; // Fail gracefully
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttl = 300) {
    try {
      cache.set(key, value, ttl);
      logger.debug({ message: 'Cache set', key, ttl });
    } catch (error) {
      logger.error({ message: 'Cache set error', key, error: error.message });
    }
  }

  /**
   * Delete single key
   */
  async del(key) {
    try {
      cache.del(key);
      logger.debug({ message: 'Cache delete', key });
    } catch (error) {
      logger.error({ message: 'Cache delete error', key, error: error.message });
    }
  }

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern) {
    try {
      const keys = cache.keys(pattern);
      if (keys.length > 0) {
        keys.forEach((key) => cache.del(key));
        logger.debug({ message: 'Cache pattern delete', pattern, count: keys.length });
      }
    } catch (error) {
      logger.error({ message: 'Cache pattern delete error', pattern, error: error.message });
    }
  }

  /**
   * Clear all cache
   */
  async flush() {
    try {
      cache.flushdb();
      logger.info({ message: 'Cache flushed' });
    } catch (error) {
      logger.error({ message: 'Cache flush error', error: error.message });
    }
  }

  /**
   * Get or set pattern
   * If data exists in cache, return it. Otherwise, fetch from callback and cache.
   */
  async getOrSet(key, callback, ttl = 300) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await callback();
    await this.set(key, data, ttl);
    return data;
  }

  // === Domain-Specific Methods ===

  /**
   * Dashboard stats cache
   */
  async getDashboardStats(userId, role) {
    return this.get(`dashboard:stats:${role}:${userId}`);
  }

  async setDashboardStats(userId, role, data, ttl = 300) {
    await this.set(`dashboard:stats:${role}:${userId}`, data, ttl);
  }

  async invalidateDashboardStats() {
    await this.delPattern('dashboard:stats:*');
  }

  /**
   * Complaint cache
   */
  async getComplaint(id) {
    return this.get(`complaint:${id}`);
  }

  async setComplaint(id, data, ttl = 600) {
    await this.set(`complaint:${id}`, data, ttl);
  }

  async invalidateComplaint(id) {
    await this.delPattern(`complaint:${id}:*`);
    await this.invalidateComplaintsList();
    await this.invalidateDashboardStats();
  }

  /**
   * Complaints list cache
   */
  async getComplaintsList(filters) {
    const key = `complaints:list:${JSON.stringify(filters)}`;
    return this.get(key);
  }

  async setComplaintsList(filters, data, ttl = 300) {
    const key = `complaints:list:${JSON.stringify(filters)}`;
    await this.set(key, data, ttl);
  }

  async invalidateComplaintsList() {
    await this.delPattern('complaints:list:*');
  }

  /**
   * Department cache
   */
  async getDepartments() {
    return this.get('departments:all');
  }

  async setDepartments(data, ttl = 3600) {
    await this.set('departments:all', data, ttl);
  }

  async invalidateDepartments() {
    await this.del('departments:all');
  }

  /**
   * Category cache
   */
  async getCategories() {
    return this.get('categories:all');
  }

  async setCategories(data, ttl = 3600) {
    await this.set('categories:all', data, ttl);
  }

  async invalidateCategories() {
    await this.del('categories:all');
  }

  /**
   * User cache
   */
  async getUser(id) {
    return this.get(`user:${id}`);
  }

  async setUser(id, data, ttl = 600) {
    await this.set(`user:${id}`, data, ttl);
  }

  async invalidateUser(id) {
    await this.del(`user:${id}`);
  }

  async invalidateUsersList() {
    await this.delPattern('users:list:*');
  }
}

module.exports = new CacheService();
