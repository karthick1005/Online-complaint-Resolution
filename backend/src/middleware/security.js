/**
 * Security Middleware
 * 
 * Provides security headers and protection using Helmet
 */

const helmet = require('helmet');

/**
 * Configure Helmet security headers
 */
const securityHeaders = [
  // Basic helmet protection
  helmet(),

  // Content Security Policy
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  }),

  // Strict Transport Security (HTTPS only)
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }),

  // Prevent clickjacking
  helmet.frameguard({ action: 'deny' }),

  // Prevent MIME type sniffing
  helmet.noSniff(),

  // Remove X-Powered-By header
  helmet.hidePoweredBy(),

  // XSS Protection
  helmet.xssFilter(),

  // Referrer Policy
  helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),
];

module.exports = securityHeaders;
