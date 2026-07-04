import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import chatRoutes from './chatRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import networkRoutes from './networkRoutes.js';
import mapsRoutes from './mapsRoutes.js';
import predictionRoutes from './predictionRoutes.js';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// System Health Verification route
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  return sendResponse(res, 200, 'System and database health diagnostics', {
    status: 'Healthy',
    databaseConnection: dbStatus,
    timestamp: new Date(),
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/network', networkRoutes);
router.use('/maps', mapsRoutes);
router.use('/prediction', predictionRoutes);

export default router;
