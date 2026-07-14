import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import User from '../models/User.js';
import PoliceStation from '../models/PoliceStation.js';
import CrimeCategory from '../models/CrimeCategory.js';
import CrimeLocation from '../models/CrimeLocation.js';
import Criminal from '../models/Criminal.js';
import Victim from '../models/Victim.js';
import Vehicle from '../models/Vehicle.js';
import PhoneNumber from '../models/PhoneNumber.js';
import BankAccount from '../models/BankAccount.js';
import FIR from '../models/FIR.js';
import Evidence from '../models/Evidence.js';
import ChatSession from '../models/ChatSession.js';
import AuditLog from '../models/AuditLog.js';

import logger from '../config/logger.js';

// Resolve directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const models = [
  { name: 'User', model: User },
  { name: 'PoliceStation', model: PoliceStation },
  { name: 'CrimeCategory', model: CrimeCategory },
  { name: 'CrimeLocation', model: CrimeLocation },
  { name: 'Criminal', model: Criminal },
  { name: 'Victim', model: Victim },
  { name: 'Vehicle', model: Vehicle },
  { name: 'PhoneNumber', model: PhoneNumber },
  { name: 'BankAccount', model: BankAccount },
  { name: 'FIR', model: FIR },
  { name: 'Evidence', model: Evidence },
  { name: 'ChatSession', model: ChatSession },
  { name: 'AuditLog', model: AuditLog }
];

export const clearDatabase = async () => {
  logger.info('Starting database clearing operation...');
  
  for (const m of models) {
    try {
      const result = await m.model.deleteMany({});
      logger.info(`Cleared collection [${m.name}] - Deleted ${result.deletedCount} documents.`);
    } catch (error) {
      logger.error(`Error clearing collection [${m.name}]: ${error.message}`);
      throw error;
    }
  }
  
  logger.info('All collections cleared successfully.');
};

const run = async () => {
  // Only connect and run directly if this file is executed directly (not imported)
  if (process.argv[1] && process.argv[1].endsWith('clearDatabase.js')) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      logger.error('MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    
    try {
      logger.info('Connecting to database...');
      await mongoose.connect(mongoUri);
      await clearDatabase();
      logger.info('Closing database connection...');
      await mongoose.disconnect();
      logger.info('Operation complete.');
      process.exit(0);
    } catch (error) {
      logger.error(`Database clear process failed: ${error.message}`);
      process.exit(1);
    }
  }
};

run();
