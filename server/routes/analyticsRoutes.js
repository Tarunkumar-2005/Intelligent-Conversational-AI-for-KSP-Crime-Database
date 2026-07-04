import express from 'express';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Placeholder for high-level aggregated charts
router.get('/summary', (req, res) => {
  return sendResponse(res, 501, 'Crime summary analytics endpoint: Under Construction');
});

export default router;
