import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';

// Development-specific detailed error output
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production-specific sanitized error output
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send user-friendly message
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown system error: log details and hide technical specs from user
    logger.error('CRITICAL SYSTEM FAILURE:', err);
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred. Please contact the administrator.',
    });
  }
};

// Handle specific database and auth errors to yield clean operational codes
const handleCastErrorDB = (err) => {
  const message = `Invalid path value: ${err.path} (${err.value}).`;
  return new AppError(message, 400);
};

const handleDuplicateKeyDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate value error: Resource ${value} already exists.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input parameters: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid authentication token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Authentication token has expired. Please log in again.', 401);

// Global Error Handler Middleware function
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateKeyDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
