const { ZodError } = require('zod');

/**
 * Strips any sensitive credentials (e.g. MongoDB connection strings, auth tokens) from strings.
 * @param {string} str
 * @returns {string} Sanitized string
 */
const sanitizeMessage = (str) => {
  if (typeof str !== 'string') return '';
  // Mask credentials in URIs: mongodb(+srv)://user:pass@host -> mongodb$1://***:***@host
  return str.replace(
    /(mongodb(?:\+srv)?:\/\/)(?:[^:]+):(?:[^@]+)@/gi,
    '$1***:***@'
  );
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
};

/**
 * Centralized Global Error Handler Middleware
 * Strict security: Never exposes database credentials, secrets, or internal server internals.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = 'An unexpected server error occurred';
  let errors = null;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Handle Mongoose Bad ObjectId (CastError)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found with the specified identifier';
  }
  // Handle Mongoose Duplicate Key Error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }
  // Handle Malformed JSON Payload
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }
  // Safe client error messages (4xx errors)
  else if (statusCode < 500 && err.message) {
    message = sanitizeMessage(err.message);
  }

  // Internal server error log (sanitized)
  if (statusCode >= 500) {
    console.error(`[Server Error] ${sanitizeMessage(err.message || 'Unknown error')}`);
    if (err.stack) {
      console.error(sanitizeMessage(err.stack));
    }
  }

  const responseBody = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };

  // In development mode, provide sanitized debug details so developer can diagnose immediately
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    responseBody.debug = sanitizeMessage(err.message || 'Unknown error');
  }

  res.status(statusCode).json(responseBody);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
