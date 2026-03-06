const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../utils/errorClasses');

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later',
    });
  },
});

/**
 * Strict rate limiter for auth endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many authentication attempts, please try again later',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts, please try again in 15 minutes',
    });
  },
});

/**
 * Rate limiter for file uploads
 * Limits: 10 uploads per hour per user
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => {
    // Rate limit by user ID instead of IP
    return req.user?.id || req.ip;
  },
  message: 'Upload limit exceeded, please try again later',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many uploads, please try again in 1 hour',
    });
  },
});

/**
 * Rate limiter for complaint creation
 * Limits: 10 complaints per day per user
 */
const complaintCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  skipSuccessfulRequests: false,
  message: 'Daily complaint limit reached',
  handler: (req, res) => {
    res.status(429).json({
      error: 'You have reached your daily complaint limit (10 per day)',
    });
  },
});

/**
 * Dynamic rate limiter based on user role
 */
const roleBased RateLimiter = (roleConfig) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'guest';
    const config = roleConfig[userRole] || roleConfig.default;

    const limiter = rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      keyGenerator: (req) => `${req.user?.id || req.ip}-${userRole}`,
      handler: (req, res) => {
        res.status(429).json({
          error: config.message || 'Rate limit exceeded',
        });
      },
    });

    return limiter(req, res, next);
  };
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  complaintCreationLimiter,
  roleBasedRateLimiter,
};
