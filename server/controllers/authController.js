import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { signToken } from '../config/jwt.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';

/**
 * Handles secure user authentication and login
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validate inputs exist
  if (!email || !password) {
    return next(new AppError('Please provide both email address and password.', 400));
  }

  // 2. Query user by email and explicitly select password hash
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    // Audit failed login attempt (unauthenticated, so user is null)
    await AuditLog.create({
      user: null,
      action: 'LOGIN_FAILED',
      details: `Failed authentication attempt for email: ${email}`,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    return next(new AppError('Invalid email address or password.', 401));
  }

  // 3. Verify if user account is active
  if (!user.isActive) {
    await AuditLog.create({
      user: user._id,
      action: 'LOGIN_FAILED',
      details: `Login block: Deactivated account access attempt by ${email}`,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    return next(new AppError('Your account has been deactivated. Please contact the administrator.', 403));
  }

  // 4. Update last login timestamp safely
  await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

  // 5. Generate secure JWT token
  const token = signToken({ id: user._id, role: user.role });

  // 6. Write success log in audit logs
  await AuditLog.create({
    user: user._id,
    action: 'LOGIN_SUCCESS',
    details: `User ${user.name} (${user.badgeNumber}) authenticated successfully.`,
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  // 7. Strip sensitive fields and return payload
  return sendResponse(res, 200, 'User logged in successfully.', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      badgeNumber: user.badgeNumber,
      policeStation: user.policeStation,
    },
  });
});

/**
 * Handles user logout
 */
export const logout = asyncHandler(async (req, res, next) => {
  // Write audit trail for session logging out
  await AuditLog.create({
    user: req.user._id,
    action: 'LOGOUT',
    details: `User ${req.user.name} logged out and terminated session.`,
    ipAddress: req.ip,
    timestamp: new Date(),
  });

  return sendResponse(res, 200, 'User logged out successfully.');
});

/**
 * Returns currently authenticated user context profile
 */
export const getMe = asyncHandler(async (req, res, next) => {
  return sendResponse(res, 200, 'Current user context retrieved.', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      badgeNumber: req.user.badgeNumber,
      policeStation: req.user.policeStation,
    },
  });
});
