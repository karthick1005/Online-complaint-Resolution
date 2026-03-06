const pino = require('pino');

/**
 * Pino Logger Configuration
 * 
 * Production-ready logging with:
 * - Structured JSON logs
 * - Pretty printing in development
 * - Log levels
 * - Request correlation IDs
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Pretty print in development
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Base configuration
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  // Add timestamp
  timestamp: pino.stdTimeFunctions.isoTime,

  // Redact sensitive information
  redact: {
    paths: ['password', 'passwordHash', 'token', 'authorization'],
    censor: '[REDACTED]',
  },
});

/**
 * Logger middleware for Express
 * Logs all HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    logger[logLevel]({
      type: 'response',
      method: req.method,
      url: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
  });

  next();
};

/**
 * Log user authentication attempts
 */
const logAuth = (userId, email, success, message = '') => {
  logger.info({
    type: 'auth',
    userId,
    email,
    success,
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log complaint events
 */
const logComplaint = (action, complaintId, userId, details = {}) => {
  logger.info({
    type: 'complaint',
    action,
    complaintId,
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log SLA breaches
 */
const logSLABreach = (complaintId, slaDeadline, details = {}) => {
  logger.warn({
    type: 'sla_breach',
    complaintId,
    slaDeadline,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log file uploads
 */
const logFileUpload = (userId, fileName, fileSize, complaintId) => {
  logger.info({
    type: 'file_upload',
    userId,
    fileName,
    fileSize,
    complaintId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log errors
 */
const logError = (error, context = {}) => {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logger,
  requestLogger,
  logAuth,
  logComplaint,
  logSLABreach,
  logFileUpload,
  logError,
};
