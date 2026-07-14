import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route: User Login
router.post('/login', login);

// Protected routes: Requires valid JWT session token
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
