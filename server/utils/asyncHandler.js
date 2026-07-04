/**
 * Wraps async Express controller functions to automatically forward errors to the global error handler
 * without requiring verbose try-catch blocks.
 * @param {Function} fn - Async controller function
 * @returns {Function}
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
