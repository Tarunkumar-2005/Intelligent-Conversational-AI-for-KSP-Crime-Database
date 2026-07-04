/**
 * Standard API Response utility to format successful REST payloads consistently.
 * @param {Object} res - Express Response object
 * @param {number} statusCode - HTTP status code (200, 201)
 * @param {string} message - User-friendly message
 * @param {Object|Array} [data=null] - Payload result array or object
 */
export const sendResponse = (res, statusCode, message, data = null) => {
  const responsePayload = {
    status: 'success',
    message,
  };

  if (data !== null) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};
