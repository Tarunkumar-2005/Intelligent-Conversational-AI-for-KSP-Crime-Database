import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Load generators
import {
  generateUsers,
  generatePoliceStations,
  generateCrimeCategories,
  generateCrimeLocations,
  generatePhoneNumbers,
  generateBankAccounts,
  generateCriminals,
  generateVictims,
  generateVehicles,
  generateFIRs,
  generateEvidence,
  generateChatSessions,
  generateAuditLogs,
} from './generators/entityGenerators.js';

import { clearDatabase } from './clearDatabase.js';
import verify from './verifySeed.js';
import logger from '../config/logger.js';

// Resolve directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env variables
dotenv.config({ path: dirname(__dirname) + '/.env' });

const seed = async () => {
  logger.info('🚀 Initiating database seeding sequence...');
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    // 1. Connect to DB
    logger.info('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    logger.info('Database connection established.');

    // 2. Clear Database
    await clearDatabase();

    // 3. Generate data in memory
    logger.info('Generating synthetic datasets in memory...');
    
    logger.info('  Generating Police Stations (target: 8)...');
    const stations = generatePoliceStations();
    
    logger.info('  Generating Crime Categories (target: 10)...');
    const categories = generateCrimeCategories();
    
    logger.info('  Generating Crime Locations (target: 50)...');
    const locations = generateCrimeLocations(50, stations);
    
    logger.info('  Generating Phone Numbers (target: 250)...');
    const phones = generatePhoneNumbers(250);
    
    logger.info('  Generating Bank Accounts (target: 150)...');
    const accounts = generateBankAccounts(150);
    
    logger.info('  Generating Users (target: 10)...');
    const users = generateUsers(10, stations);
    
    logger.info('  Generating Criminals (target: 120)...');
    const criminals = generateCriminals(120, phones, accounts);
    
    logger.info('  Generating Victims (target: 250)...');
    const victims = generateVictims(250);
    
    logger.info('  Generating Vehicles (target: 150)...');
    const vehicles = generateVehicles(150);
    
    logger.info('  Generating FIRs with repeat offenders and gangs (target: 300)...');
    const firs = generateFIRs(300, stations, users, categories, locations, criminals, victims, vehicles, phones, accounts);
    
    logger.info('  Generating Evidences linked to FIRs (target: 400)...');
    const evidences = generateEvidence(400, firs, users);
    
    logger.info('  Generating Chat Sessions (target: 30)...');
    const chats = generateChatSessions(30, users);
    
    logger.info('  Generating Audit Logs (target: 200)...');
    const audits = generateAuditLogs(200, users);

    logger.info('All synthetic records constructed in memory. Starting bulk database insert...');

    // 4. Batch insert into database
    await PoliceStation.insertMany(stations);
    logger.info(`Inserted ${stations.length} Police Stations.`);

    await CrimeCategory.insertMany(categories);
    logger.info(`Inserted ${categories.length} Crime Categories.`);

    await CrimeLocation.insertMany(locations);
    logger.info(`Inserted ${locations.length} Crime Locations.`);

    await PhoneNumber.insertMany(phones);
    logger.info(`Inserted ${phones.length} Phone Numbers.`);

    await BankAccount.insertMany(accounts);
    logger.info(`Inserted ${accounts.length} Bank Accounts.`);

    await User.insertMany(users);
    logger.info(`Inserted ${users.length} Users.`);

    await Criminal.insertMany(criminals);
    logger.info(`Inserted ${criminals.length} Criminals.`);

    await Victim.insertMany(victims);
    logger.info(`Inserted ${victims.length} Victims.`);

    await Vehicle.insertMany(vehicles);
    logger.info(`Inserted ${vehicles.length} Vehicles.`);

    await FIR.insertMany(firs);
    logger.info(`Inserted ${firs.length} FIRs.`);

    await Evidence.insertMany(evidences);
    logger.info(`Inserted ${evidences.length} Evidences.`);

    await ChatSession.insertMany(chats);
    logger.info(`Inserted ${chats.length} Chat Sessions.`);

    await AuditLog.insertMany(audits);
    logger.info(`Inserted ${audits.length} Audit Logs.`);

    logger.info('🎉 Data insertion phase completed successfully!');

    // 5. Verification Phase
    logger.info('Triggering post-seed verification checks...');
    const verificationPass = await verify();

    if (verificationPass) {
      logger.info('✅ Database seeded and verified successfully!');
    } else {
      logger.error('❌ Database seeding succeeded but verification reported issues.');
    }

  } catch (error) {
    logger.error(`❌ Critical error during database seeding: ${error.stack}`);
    process.exit(1);
  } finally {
    logger.info('Closing MongoDB connection...');
    await mongoose.disconnect();
    logger.info('Seeding routine completed.');
    process.exit(0);
  }
};

seed();
