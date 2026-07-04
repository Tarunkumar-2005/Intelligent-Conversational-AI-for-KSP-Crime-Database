import express from 'express';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Placeholder for future hotspots & early warning analytics
router.get('/forecast', (req, res) => {
  return sendResponse(res, 501, 'Crime forecasting and predictions endpoint: Under Construction');
});

export default router;
