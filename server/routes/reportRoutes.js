import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { sendResponse } from '../utils/responseHandler.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../config/logger.js';

const router = express.Router();

router.use(authenticate);

/**
 * Logs a PDF export event in the AuditLog collection
 */
router.post(
  '/log',
  asyncHandler(async (req, res) => {
    const { reportType, targetId } = req.body;
    
    logger.info(`Reports System: User ${req.user.name} requesting PDF export of "${reportType}" for id "${targetId}"`);

    const log = await AuditLog.create({
      user: req.user._id,
      action: 'REPORT_EXPORT',
      details: `Exported ${reportType} report for target ID: ${targetId || 'N/A'}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    return sendResponse(res, 201, 'Export event audited successfully.', log);
  })
);

/**
 * Retrieves the list of export logs (restricted to Supervisors)
 */
router.get(
  '/log',
  authorize('Supervisor'),
  asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({ action: 'REPORT_EXPORT' })
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();

    return sendResponse(res, 200, 'Audit export logs retrieved.', logs);
  })
);

/**
 * Returns names of configured templates
 */
router.get(
  '/templates',
  (req, res) => {
    const templates = [
      { id: 'chat', name: 'Chat Report Template', fields: ['title', 'date', 'messages'] },
      { id: 'investigation', name: 'Investigation Case Dossier Template', fields: ['fir', 'criminals', 'victims', 'evidence'] },
      { id: 'analytics', name: 'Analytics Metrics Dashboard Template', fields: ['trends', 'categories', 'districts'] }
    ];
    return sendResponse(res, 200, 'Templates list retrieved.', templates);
  }
);

export default router;
