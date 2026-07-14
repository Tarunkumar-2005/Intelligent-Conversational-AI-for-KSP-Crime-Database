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

const verify = async () => {
  logger.info('=== STARTING SEED INTEGRITY VERIFICATION ===');
  
  const results = {
    counts: {},
    brokenReferences: [],
    duplicates: [],
    relationships: {}
  };

  // 1. Check counts
  const targetCounts = {
    User: 10,
    PoliceStation: 8,
    CrimeCategory: 10,
    CrimeLocation: 50,
    Criminal: 120,
    Victim: 250,
    Vehicle: 150,
    PhoneNumber: 250,
    BankAccount: 150,
    Evidence: 400,
    FIR: 300,
    ChatSession: 30,
    AuditLog: 200
  };

  const models = {
    User, PoliceStation, CrimeCategory, CrimeLocation, Criminal,
    Victim, Vehicle, PhoneNumber, BankAccount, FIR, Evidence,
    ChatSession, AuditLog
  };

  logger.info('--- 1. Document Quantity Checks ---');
  for (const [name, model] of Object.entries(models)) {
    const count = await model.countDocuments({});
    results.counts[name] = count;
    const target = targetCounts[name];
    const diff = count - target;
    const status = count === 0 ? '❌ EMPTY' : count >= (target * 0.9) ? '✅ OK' : '⚠️ LOW';
    logger.info(`Collection [${name.padEnd(15)}]: Found ${String(count).padStart(4)} / Target ${String(target).padStart(4)} (${status})`);
  }

  // 2. Fetch all IDs for reference checking
  logger.info('--- 2. Fetching Object IDs for Relationship Validation ---');
  const userIds = new Set((await User.find({}, '_id')).map(d => d._id.toString()));
  const stationIds = new Set((await PoliceStation.find({}, '_id')).map(d => d._id.toString()));
  const categoryIds = new Set((await CrimeCategory.find({}, '_id')).map(d => d._id.toString()));
  const locationIds = new Set((await CrimeLocation.find({}, '_id')).map(d => d._id.toString()));
  const criminalIds = new Set((await Criminal.find({}, '_id')).map(d => d._id.toString()));
  const victimIds = new Set((await Victim.find({}, '_id')).map(d => d._id.toString()));
  const vehicleIds = new Set((await Vehicle.find({}, '_id')).map(d => d._id.toString()));
  const phoneIds = new Set((await PhoneNumber.find({}, '_id')).map(d => d._id.toString()));
  const bankIds = new Set((await BankAccount.find({}, '_id')).map(d => d._id.toString()));
  const firIds = new Set((await FIR.find({}, '_id')).map(d => d._id.toString()));
  const evidenceIds = new Set((await Evidence.find({}, '_id')).map(d => d._id.toString()));

  // 3. Broken ObjectId References Checks
  logger.info('--- 3. Scanning for Broken References ---');

  // Helper function to check array or single ref
  const checkRef = (sourceCollection, sourceId, fieldName, targetSet, refId, refCollection) => {
    if (!refId) return;
    const refStr = refId.toString();
    if (!targetSet.has(refStr)) {
      results.brokenReferences.push({
        sourceCollection,
        sourceId: sourceId.toString(),
        fieldName,
        brokenId: refStr,
        targetCollection: refCollection
      });
    }
  };

  // Check Users
  const users = await User.find({});
  users.forEach(u => {
    checkRef('User', u._id, 'policeStation', stationIds, u.policeStation, 'PoliceStation');
  });

  // Check CrimeLocations
  const locations = await CrimeLocation.find({});
  locations.forEach(loc => {
    checkRef('CrimeLocation', loc._id, 'policeStation', stationIds, loc.policeStation, 'PoliceStation');
  });

  // Check Criminals
  const criminals = await Criminal.find({});
  criminals.forEach(c => {
    c.phoneNumbers.forEach(p => checkRef('Criminal', c._id, 'phoneNumbers', phoneIds, p, 'PhoneNumber'));
    c.bankAccounts.forEach(a => checkRef('Criminal', c._id, 'bankAccounts', bankIds, a, 'BankAccount'));
    c.firs.forEach(f => checkRef('Criminal', c._id, 'firs', firIds, f, 'FIR'));
  });

  // Check FIRs
  const firs = await FIR.find({});
  firs.forEach(f => {
    checkRef('FIR', f._id, 'policeStation', stationIds, f.policeStation, 'PoliceStation');
    checkRef('FIR', f._id, 'crimeCategory', categoryIds, f.crimeCategory, 'CrimeCategory');
    checkRef('FIR', f._id, 'occurrencePlace.location', locationIds, f.occurrencePlace.location, 'CrimeLocation');
    checkRef('FIR', f._id, 'investigatingOfficer', userIds, f.investigatingOfficer, 'User');
    f.victims.forEach(v => checkRef('FIR', f._id, 'victims', victimIds, v, 'Victim'));
    f.suspects.forEach(s => checkRef('FIR', f._id, 'suspects', criminalIds, s, 'Criminal'));
    f.vehicles.forEach(v => checkRef('FIR', f._id, 'vehicles', vehicleIds, v, 'Vehicle'));
    f.evidence.forEach(e => checkRef('FIR', f._id, 'evidence', evidenceIds, e, 'Evidence'));
  });

  // Check Evidence
  const evidences = await Evidence.find({});
  evidences.forEach(e => {
    checkRef('Evidence', e._id, 'fir', firIds, e.fir, 'FIR');
    checkRef('Evidence', e._id, 'collectedBy', userIds, e.collectedBy, 'User');
    e.chainOfCustody.forEach((log, index) => {
      checkRef('Evidence', e._id, `chainOfCustody[${index}].officer`, userIds, log.officer, 'User');
    });
  });

  // Check ChatSessions
  const chats = await ChatSession.find({});
  chats.forEach(ch => {
    checkRef('ChatSession', ch._id, 'user', userIds, ch.user, 'User');
  });

  // Check AuditLogs
  const audits = await AuditLog.find({});
  audits.forEach(au => {
    checkRef('AuditLog', au._id, 'user', userIds, au.user, 'User');
  });

  if (results.brokenReferences.length === 0) {
    logger.info('✅ No broken references found in the database!');
  } else {
    logger.error(`❌ Found ${results.brokenReferences.length} broken references:`);
    results.brokenReferences.forEach(ref => {
      logger.error(`   - [${ref.sourceCollection}] document ID ${ref.sourceId} has a broken link in field '${ref.fieldName}': ID ${ref.brokenId} does not exist in [${ref.targetCollection}]`);
    });
  }

  // 4. Unique Constraints Checks
  logger.info('--- 4. Uniqueness Constraints Verification ---');
  
  const checkDuplicates = async (model, fieldName, modelName) => {
    const dups = await model.aggregate([
      { $group: { _id: `$${fieldName}`, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, _id: { $ne: null } } }
    ]);
    if (dups.length > 0) {
      dups.forEach(d => {
        results.duplicates.push({ modelName, fieldName, value: d._id, count: d.count });
        logger.error(`❌ Duplicate unique value in [${modelName}]: field '${fieldName}' has value '${d._id}' repeated ${d.count} times.`);
      });
    }
  };

  await checkDuplicates(User, 'email', 'User');
  await checkDuplicates(User, 'badgeNumber', 'User');
  await checkDuplicates(PoliceStation, 'stationCode', 'PoliceStation');
  await checkDuplicates(PoliceStation, 'name', 'PoliceStation');
  await checkDuplicates(CrimeCategory, 'code', 'CrimeCategory');
  await checkDuplicates(CrimeCategory, 'name', 'CrimeCategory');
  await checkDuplicates(PhoneNumber, 'imsi', 'PhoneNumber');
  await checkDuplicates(BankAccount, 'accountNumber', 'BankAccount');
  await checkDuplicates(Vehicle, 'vehicleNumber', 'Vehicle');
  await checkDuplicates(FIR, 'firNumber', 'FIR');
  await checkDuplicates(Evidence, 'evidenceId', 'Evidence');

  if (results.duplicates.length === 0) {
    logger.info('✅ Uniqueness constraints are 100% clean!');
  }

  // 5. Relationship Analysis
  logger.info('--- 5. Network Graph & Analytics Verification ---');

  // Check Repeat Offenders percentage
  // Target: 20% of criminals should appear in multiple FIRs.
  const criminalFirCounts = criminals.map(c => c.firs.length);
  const offendersInMultipleFirs = criminals.filter(c => c.firs.length >= 2).length;
  const offenderPercentage = (offendersInMultipleFirs / criminals.length) * 100;
  
  results.relationships.offenderPercentage = offenderPercentage;
  const offenderStatus = Math.abs(offenderPercentage - 20) <= 5 ? '✅ OK' : '⚠️ Out of Target Range (15%-25%)';
  logger.info(`Repeat Offenders (multiple FIRs): ${offendersInMultipleFirs} / ${criminals.length} (${offenderPercentage.toFixed(1)}%) - Status: ${offenderStatus}`);

  // Check Gang Assets Sharing
  // Criminals belonging to the same gang share vehicles, phones, and bank accounts.
  // Let's check if there are shared vehicles/phones/accounts between different criminals.
  const phoneToCriminalMap = {};
  const vehicleToCriminalMap = {};
  const accountToCriminalMap = {};

  criminals.forEach(c => {
    c.phoneNumbers.forEach(p => {
      const pStr = p.toString();
      phoneToCriminalMap[pStr] = phoneToCriminalMap[pStr] || [];
      phoneToCriminalMap[pStr].push(c._id.toString());
    });
    c.bankAccounts.forEach(a => {
      const aStr = a.toString();
      accountToCriminalMap[aStr] = accountToCriminalMap[aStr] || [];
      accountToCriminalMap[aStr].push(c._id.toString());
    });
  });

  firs.forEach(f => {
    f.vehicles.forEach(v => {
      const vStr = v.toString();
      f.suspects.forEach(s => {
        const sStr = s.toString();
        vehicleToCriminalMap[vStr] = vehicleToCriminalMap[vStr] || new Set();
        vehicleToCriminalMap[vStr].add(sStr);
      });
    });
  });

  const sharedPhones = Object.entries(phoneToCriminalMap).filter(([_, crs]) => crs.length > 1).length;
  const sharedAccounts = Object.entries(accountToCriminalMap).filter(([_, crs]) => crs.length > 1).length;
  
  let sharedVehiclesCount = 0;
  Object.entries(vehicleToCriminalMap).forEach(([_, crSet]) => {
    if (crSet.size > 1) sharedVehiclesCount++;
  });

  results.relationships.sharedPhones = sharedPhones;
  results.relationships.sharedAccounts = sharedAccounts;
  results.relationships.sharedVehicles = sharedVehiclesCount;

  logger.info(`Network Assets Sharing:`);
  logger.info(`   - Shared Phone Numbers: ${sharedPhones} (Used by multiple criminals)`);
  logger.info(`   - Shared Bank Accounts: ${sharedAccounts} (Used by multiple criminals)`);
  logger.info(`   - Shared Vehicles in FIRs: ${sharedVehiclesCount} (Linked to multiple suspect criminals)`);
  
  if (sharedPhones > 0 && sharedAccounts > 0 && sharedVehiclesCount > 0) {
    logger.info('✅ Gang sharing structures successfully generated!');
  } else {
    logger.warn('⚠️ No shared criminal assets found. Gang structures might be missing.');
  }

  // 6. Geospatial Hotspot Check
  logger.info('--- 6. Geospatial Hotspots Verification ---');
  const hotspotLocations = locations.filter(loc => loc.isHotspot).length;
  const hotspotPercentage = (hotspotLocations / locations.length) * 100;
  
  logger.info(`Geospatial Locations: Total ${locations.length}, Hotspots: ${hotspotLocations} (${hotspotPercentage.toFixed(1)}%)`);
  
  // Verify coordinates are valid [long, lat]
  let invalidCoords = 0;
  locations.forEach(loc => {
    const coords = loc.coordinates?.coordinates;
    if (!coords || coords.length !== 2 || coords[0] < -180 || coords[0] > 180 || coords[1] < -90 || coords[1] > 90) {
      invalidCoords++;
    }
  });

  if (invalidCoords === 0) {
    logger.info('✅ Geospatial coordinates format is valid [longitude, latitude]');
  } else {
    logger.error(`❌ Found ${invalidCoords} locations with invalid coordinate formats.`);
  }

  // 7. Time Timeline Spikes Check
  logger.info('--- 7. Timeline Distribution Analysis ---');
  const years = {};
  firs.forEach(f => {
    const year = f.reportedDateTime.getFullYear();
    years[year] = (years[year] || 0) + 1;
  });
  logger.info(`FIR count by year:`);
  Object.entries(years).forEach(([y, c]) => {
    logger.info(`   - ${y}: ${c} cases`);
  });

  logger.info('=== VERIFICATION COMPLETED ===');
  
  const isClean = results.brokenReferences.length === 0 && results.duplicates.length === 0 && invalidCoords === 0;
  if (isClean) {
    logger.info('🎉 SUCCESS: Database seeder integrity is 100% valid and verified!');
    return true;
  } else {
    logger.error('💥 FAILURE: Database seeder integrity checks failed. Check logs above.');
    return false;
  }
};

const run = async () => {
  if (process.argv[1] && process.argv[1].endsWith('verifySeed.js')) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      logger.error('MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    
    try {
      logger.info('Connecting to database for verification...');
      await mongoose.connect(mongoUri);
      const isSuccessful = await verify();
      logger.info('Closing database connection...');
      await mongoose.disconnect();
      process.exit(isSuccessful ? 0 : 1);
    } catch (error) {
      logger.error(`Verification process failed: ${error.message}`);
      process.exit(1);
    }
  }
};

run();
export default verify;
