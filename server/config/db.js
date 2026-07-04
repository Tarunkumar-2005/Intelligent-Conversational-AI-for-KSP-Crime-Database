import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      logger.error('MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    // Configure connection settings suitable for production Mongoose
    const options = {
      autoIndex: true, // Keep auto-indexing on during development, turn off in massive production databases
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const dbConnection = await mongoose.connect(connString, options);
    logger.info(`MongoDB Connected successfully: ${dbConnection.connection.host}`);

    // Listen to connection state changes
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Reconnecting...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
