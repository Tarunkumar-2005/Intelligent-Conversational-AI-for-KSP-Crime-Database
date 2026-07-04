import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load configuration modules
import connectDB from './config/db.js';
import logger from './config/logger.js';
import { initCatalyst } from './config/catalyst.js';
import globalErrorHandler from './middleware/errorMiddleware.js';
import apiRouter from './routes/index.js';
import AppError from './utils/AppError.js';

// Setup environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Zoho Catalyst SDK if executing inside their stack
initCatalyst();

const app = express();

// Global Middlewares

// 1. HTTP Security Headers
app.use(helmet());

// 2. CORS configurations
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. API request Rate Limiter (Prevent brute-force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes windows
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 4. Request JSON Parser
app.use(express.json({ limit: '10kb' }));

// Logging HTTP Requests in development mode
app.use((req, res, next) => {
  logger.http(`${req.method} request to ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api/v1', apiRouter);

// Match unhandled routes to throw a 404 error
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server.`, 404));
});

// Centralized error interceptor
app.use(globalErrorHandler);

// Start Server Listeners
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`Express server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Intercept system failures (unhandled rejections/uncaught exceptions)
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down server gracefully...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down server immediately...');
  logger.error(err);
  process.exit(1);
});

export default app;
