/**
 * Advanced Rate Limiting Middleware
 * 
 * Provides different rate limits for different routes using in-memory storage
 */

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

/**
 * Create rate limiter with custom options
 */
const createRateLimiter = (options) => {
  return rateLimit({
    // Use memory store (default) - no Redis needed
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn({
        message: 'Rate limit exceeded',
        ip: req.ip,
        url: req.originalUrl,
        userId: req.user?.id,
      });
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests, please try again later',
        },
      });
    },
    ...options,
  });
};

/**
 * Auth routes rate limiter (stricter)
 * Prevents brute force attacks
 */
exports.authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * General API rate limiter
 */
exports.apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please slow down',
});

/**
 * File upload rate limiter
 */
exports.uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Upload limit reached, please try again later',
});

/**
 * Search/Query rate limiter
 */
exports.searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please slow down',
});

/**
 * Create complaint rate limiter
 */
exports.createComplaintLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 complaints per hour
  message: 'Complaint creation limit reached, please try again later',
});
