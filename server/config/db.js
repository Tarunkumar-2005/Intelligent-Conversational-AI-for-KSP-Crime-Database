import mongoose from 'mongoose';
import dns from 'dns';
import logger from './logger.js';

// Configure Node.js to use reliable public DNS servers for MongoDB Atlas SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // fallback if system restricts custom DNS servers
}

const connectDB = async () => {
  try {
    const connString = process.env.ATLAS_DB_URL || process.env.MONGODB_URI;
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
