class AppError extends Error {
  /**
   * Centralized Application Error Class
   * @param {string} message - Error details message
   * @param {number} statusCode - HTTP response code (e.g. 400, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Distinguish operational errors (validations, auth) from systemic crashes
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
