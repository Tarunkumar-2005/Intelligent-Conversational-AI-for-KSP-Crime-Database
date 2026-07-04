import express from 'express';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Placeholder for Cytoscape elements request
router.get('/graph/:firId', (req, res) => {
  return sendResponse(res, 501, 'Criminal network linkages graph endpoint: Under Construction');
});

export default router;
