const { AppError, ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { logger } = require('../utils/logger');

/**
 * Centralized Error Handler Middleware
 * 
 * Catches all errors and sends standardized responses with proper logging
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.code = err.code || 'INTERNAL_ERROR';

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        error = new AppError(
          'Duplicate entry found',
          409,
          'DUPLICATE_ENTRY',
          { field: err.meta?.target }
        );
        break;
      case 'P2025':
        error = new NotFoundError();
        break;
      case 'P2003':
        error = new ValidationError('Invalid reference - related record not found', {
          field: err.meta?.field_name,
        });
        break;
      case 'P2014':
        error = new ValidationError('Invalid ID format');
        break;
      default:
        error = new AppError('Database operation failed', 500, 'DATABASE_ERROR');
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error = new ValidationError('File size exceeds limit', {
          limit: process.env.MAX_FILE_SIZE || 10485760,
        });
        break;
      case 'LIMIT_FILE_COUNT':
        error = new ValidationError('Too many files', { limit: 5 });
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = new ValidationError('Unexpected file field');
        break;
      default:
        error = new ValidationError('File upload error');
    }
  }

  // Validation errors (express-validator)
  if (err.errors && Array.isArray(err.errors)) {
    const messages = err.errors.map((e) => e.msg).join(', ');
    const fields = err.errors.reduce((acc, e) => {
      acc[e.param] = e.msg;
      return acc;
    }, {});
    error = new ValidationError(messages, { fields });
  }

  // Log error with context
  logger.error({
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    details: error.details,
  });

  // Send response
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    },
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
