/**
 * Request Logger Middleware
 * 
 * Logs all HTTP requests with timing and user context
 */

const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const logData = {
      type: 'response',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      ip: req.ip,
    };

    // Use appropriate log level based on status code
    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};

module.exports = requestLogger;
