import express from 'express';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Placeholder for hotspot coordinates retrieval
router.get('/hotspots', (req, res) => {
  return sendResponse(res, 501, 'Crime mapping hotspots endpoint: Under Construction');
});

export default router;
