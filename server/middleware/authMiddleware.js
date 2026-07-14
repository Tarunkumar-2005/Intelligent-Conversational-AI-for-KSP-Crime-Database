import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication Middleware: Protects routes by validating JWT Bearer tokens
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please provide a valid Bearer token.', 401));
  }

  // 2. Cryptographically verify the token
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return next(new AppError('Invalid or expired token. Please authenticate again.', 401));
  }

  // 3. Query the user and confirm existence
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this session no longer exists.', 401));
  }

  // 4. Check if the user account is active
  if (!user.isActive) {
    return next(new AppError('This user account has been deactivated. Please contact the system administrator.', 403));
  }

  // 5. Grant access: Attach user payload to request context
  req.user = user;
  next();
});

/**
 * Authorization Middleware: Standardizes Role-Based Access Control (RBAC) boundaries
 * @param {...string} allowedRoles - list of roles authorized to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied. You do not have permission to perform this action.', 403));
    }
    next();
  };
};
