import express from 'express';
import { 
  createConversation, 
  getConversations, 
  getConversationById, 
  updateConversation, 
  deleteConversation, 
  postMessage 
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Enforce JWT Bearer Authentication on all chat endpoints
router.use(authenticate);

// 1. Thread management endpoints
router.post('/conversations', createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.patch('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);

// 2. Messaging endpoints
// Supports URL path parameters: POST /api/v1/chat/conversations/:id/message
router.post('/conversations/:id/message', postMessage);

// Supports body parameters for POST /api/v1/chat/message
router.post('/message', asyncHandler(async (req, res, next) => {
  const { conversationId, message, content } = req.body;
  
  if (!conversationId) {
    return next(new AppError('Please provide a valid conversationId in the request body.', 400));
  }
  
  // Re-map request parameters to controller context
  req.params.id = conversationId;
  return postMessage(req, res, next);
}));

export default router;
