import express from 'express';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Placeholder for Conversational AI Query
router.post('/query', (req, res) => {
  return sendResponse(res, 501, 'AI Chat query endpoint: Under Construction');
});

// Placeholder for Session listings
router.get('/sessions', (req, res) => {
  return sendResponse(res, 501, 'AI Chat sessions endpoint: Under Construction');
});

export default router;
