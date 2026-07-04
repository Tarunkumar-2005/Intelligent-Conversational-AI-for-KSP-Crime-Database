import express from 'express';
import { sendResponse } from '../utils/responseHandler.js';

const router = express.Router();

// Placeholder for Login
router.post('/login', (req, res) => {
  return sendResponse(res, 501, 'Authentication login endpoint: Under Construction');
});

// Placeholder for User Registration
router.post('/register', (req, res) => {
  return sendResponse(res, 501, 'Authentication registration endpoint: Under Construction');
});

export default router;
