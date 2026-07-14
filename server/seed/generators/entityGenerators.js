import { fakerEN_IN as faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  getRandomInt,
  getRandomElement,
  getRandomElements,
  generateClusteredCoordinates,
  generateTimelineDate,
  generateVehicleNumber,
  generateAccountNumber,
  generateIMSI,
  generateIMEI,
  generateEvidenceId,
  generateIndianPhoneNumber,
} from '../helpers/utils.js';
import {
  POLICE_STATIONS,
  CRIME_CATEGORIES,
  GANGS,
  BANKS,
  MOBILE_PROVIDERS,
  VEHICLE_BRANDS,
  LOCATION_TYPES,
} from '../constants/karnatakaData.js';

// Pre-hash password for users to save CPU time during seeding
const hashedDefaultPassword = bcrypt.hashSync('Password@123', 12);

/**
 * Generates User documents
 */
export const generateUsers = (count, stationDocs) => {
  const users = [];
  const roles = ['Investigator', 'Analyst', 'Supervisor', 'Policymaker'];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const badgeYear = getRandomInt(2010, 2025);
    const badgeNum = String(1000 + i).slice(1);
    const badgeNumber = `KSP-${badgeYear}-${badgeNum}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ksp.gov.in`.replace(/[^a-z0-9.@]/g, '');

    // Role distribution: 1 policymaker, 2 supervisors, 2 analysts, remainder investigators
    let role = 'Investigator';
    if (i === 0) role = 'Policymaker';
    else if (i <= 2) role = 'Supervisor';
    else if (i <= 4) role = 'Analyst';

    // Assign police station only to Investigators and Supervisors
    let policeStation = undefined;
    if (['Investigator', 'Supervisor'].includes(role) && stationDocs.length > 0) {
      policeStation = getRandomElement(stationDocs)._id;
    }

    users.push({
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      password: hashedDefaultPassword, // pre-hashed to avoid double-hashing on save
      role,
      badgeNumber,
      policeStation,
      phoneNumber: generateIndianPhoneNumber(),
      isActive: true,
      lastLogin: faker.date.between({ from: '2026-01-01', to: '2026-06-30' }),
    });
  }
  return users;
};

/**
 * Maps static Police Station configurations to Mongoose documents
 */
export const generatePoliceStations = () => {
  return POLICE_STATIONS.map((ps) => ({
    _id: new mongoose.Types.ObjectId(),
    name: ps.name,
    stationCode: ps.stationCode,
    district: ps.district,
    division: ps.division,
    contactNumber: ps.contactNumber,
    address: ps.address,
    location: {
      type: 'Point',
      coordinates: ps.coordinates,
    },
  }));
};

/**
 * Maps static Crime Category configurations to Mongoose documents
 */
export const generateCrimeCategories = () => {
  return CRIME_CATEGORIES.map((cc) => ({
    _id: new mongoose.Types.ObjectId(),
    name: cc.name,
    code: cc.code,
    description: cc.description,
    severityLevel: cc.severityLevel,
    isActive: true,
  }));
};

/**
 * Generates Crime Location documents
 */
export const generateCrimeLocations = (count, stationDocs) => {
  const locations = [];
  const areaSuffixes = ['Cross', 'Main Road', 'Layout', 'Circle', 'Market', 'Junction', 'Nagar', 'Extension'];
  
  for (let i = 0; i < count; i++) {
    const station = getRandomElement(stationDocs);
    const stationConfig = POLICE_STATIONS.find(s => s.stationCode === station.stationCode) || POLICE_STATIONS[0];
    
    // Cluster coordinate generation: 20% hotspots get tighter grouping
    const isHotspot = Math.random() < 0.25;
    const locationCoords = generateClusteredCoordinates(station.district, isHotspot);
    
    const streetName = faker.location.street();
    const suffix = getRandomElement(areaSuffixes);
    const locationName = `${streetName} ${suffix}, near ${faker.company.name()}`;
    
    const areaCode = String(getRandomInt(560001, 572200));

    locations.push({
      _id: new mongoose.Types.ObjectId(),
      district: station.district,
      division: station.division,
      policeStation: station._id,
      locationName,
      coordinates: locationCoords,
      areaCode,
      locationType: getRandomElement(LOCATION_TYPES),
      isHotspot,
    });
  }
  return locations;
};

/**
 * Generates Phone Number documents
 */
export const generatePhoneNumbers = (count) => {
  const phoneNumbers = [];
  for (let i = 0; i < count; i++) {
    phoneNumbers.push({
      _id: new mongoose.Types.ObjectId(),
      phoneNumber: generateIndianPhoneNumber(),
      serviceProvider: getRandomElement(MOBILE_PROVIDERS),
      imsi: generateIMSI(),
      imei: generateIMEI(),
      ownerName: `${faker.person.firstName()} ${faker.person.lastName()}`,
      isActive: Math.random() < 0.85,
      activationDate: faker.date.between({ from: '2020-01-01', to: '2025-12-31' }),
    });
  }
  return phoneNumbers;
};

/**
 * Generates Bank Account documents
 */
export const generateBankAccounts = (count) => {
  const bankAccounts = [];
  for (let i = 0; i < count; i++) {
    const bank = getRandomElement(BANKS);
    const branchName = `${faker.location.city()} Branch`;
    const randDigits = String(getRandomInt(100000, 999999));
    const ifscCode = `${bank.code}0${randDigits}`;
    
    bankAccounts.push({
      _id: new mongoose.Types.ObjectId(),
      accountNumber: generateAccountNumber(),
      bankName: bank.name,
      branchName,
      ifscCode,
      accountHolderName: `${faker.person.firstName()} ${faker.person.lastName()}`,
      accountType: getRandomElement(['Savings', 'Current', 'Joint']),
      balance: parseFloat(getRandomInt(5000, 1500000)),
      isActive: Math.random() < 0.9,
    });
  }
  return bankAccounts;
};

/**
 * Generates Criminal documents
 */
export const generateCriminals = (count, phoneDocs, bankDocs) => {
  const criminals = [];
  const builds = ['Lean', 'Medium', 'Athletic', 'Heavy', 'Obese'];
  const eyeColors = ['Black', 'Brown', 'Dark Brown', 'Hazel', 'Grey'];
  const hairColors = ['Black', 'Dark Brown', 'Grey', 'Bald', 'Dyed'];
  const marks = [
    'Scar on left cheek',
    'Tattoo of a dragon on right arm',
    'Mole on neck',
    'Scar on forehead',
    'Tattoo of trident on chest',
    'Limp on left leg',
    'Deformed index finger',
    'Stitch marks on right eyebrow',
  ];
  
  const allModusOperandi = CRIME_CATEGORIES.flatMap(c => c.modusOperandi);

  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.9 ? 'Male' : 'Female';
    const firstName = faker.person.firstName(gender.toLowerCase());
    const lastName = faker.person.lastName();
    
    // 30% have aliases
    const aliases = [];
    if (Math.random() < 0.3) {
      aliases.push(faker.person.firstName());
    }

    const dateOfBirth = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
    
    // Assign 1-2 phone numbers
    const phones = getRandomElements(phoneDocs, getRandomInt(1, 2)).map(p => p._id);
    // Assign 1 bank account (70% probability)
    const accounts = Math.random() < 0.7 ? [getRandomElement(bankDocs)._id] : [];

    criminals.push({
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      aliases,
      gender,
      dateOfBirth,
      photoUrl: `https://randomuser.me/api/portraits/${gender === 'Male' ? 'men' : 'women'}/${getRandomInt(1, 99)}.jpg`,
      physicalDescription: {
        heightCm: getRandomInt(150, 190),
        build: getRandomElement(builds),
        eyeColor: getRandomElement(eyeColors),
        hairColor: getRandomElement(hairColors),
        distinguishingMarks: getRandomElements(marks, getRandomInt(0, 2)),
      },
      modusOperandi: getRandomElements(allModusOperandi, getRandomInt(1, 3)),
      status: getRandomElement(['Active', 'In Custody', 'Absconding', 'Under Trial']),
      phoneNumbers: phones,
      bankAccounts: accounts,
      firs: [], // Filled during FIR generation
      lastKnownLocation: {
        description: `${faker.location.streetAddress()}, Karnataka`,
        location: generateClusteredCoordinates('Bengaluru', false),
      },
    });
  }
  return criminals;
};

/**
 * Generates Victim documents
 */
export const generateVictims = (count) => {
  const victims = [];
  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? 'Male' : 'Female';
    const firstName = faker.person.firstName(gender.toLowerCase());
    const lastName = faker.person.lastName();
    const contactNumber = generateIndianPhoneNumber();
    const address = `${faker.location.streetAddress()}, ${faker.location.city()}, Karnataka`;
    const provider = getRandomElement(['gmail.com', 'yahoo.com', 'outlook.in', 'hotmail.com']);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${provider}`.replace(/[^a-z0-9.@-]/g, '');
    const dateOfBirth = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });

    victims.push({
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      gender,
      contactNumber,
      address,
      email,
      dateOfBirth,
    });
  }
  return victims;
};

/**
 * Generates Vehicle documents
 */
export const generateVehicles = (count) => {
  const vehicles = [];
  const types = Object.keys(VEHICLE_BRANDS);
  const colors = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Brown'];
  
  for (let i = 0; i < count; i++) {
    const type = getRandomElement(types);
    const brand = getRandomElement(VEHICLE_BRANDS[type]);
    const model = getRandomElement(brand.models);
    const make = brand.make;
    const color = getRandomElement(colors);
    
    // Choose random district for registration number
    const dist = getRandomElement(['Bengaluru', 'Mysuru', 'Mandya', 'Tumakuru']);
    const vehicleNumber = generateVehicleNumber(dist);
    const ownerName = `${faker.person.firstName()} ${faker.person.lastName()}`;

    vehicles.push({
      _id: new mongoose.Types.ObjectId(),
      vehicleNumber,
      type,
      make,
      model,
      color,
      ownerName,
      isStolen: Math.random() < 0.15,
    });
  }
  return vehicles;
};

/**
 * Generates FIR documents and connects relationships
 */
export const generateFIRs = (
  count,
  stationDocs,
  userDocs,
  categoryDocs,
  locationDocs,
  criminalDocs,
  victimDocs,
  vehicleDocs,
  phoneDocs,
  bankDocs
) => {
  const firs = [];
  
  // 1. GANG CREATION
  // Set up 3–5 gangs. Members of a gang will share vehicles, phones, and bank accounts.
  const gangCount = getRandomInt(3, 5);
  const gangs = [];
  
  // Distribute about 25% of criminals into gangs
  const gangCriminals = getRandomElements(criminalDocs, Math.floor(criminalDocs.length * 0.25));
  
  for (let g = 0; g < gangCount; g++) {
    const gangConfig = GANGS[g] || { name: `Gang ${g + 1}`, tag: `G${g+1}` };
    const memberCount = Math.floor(gangCriminals.length / gangCount);
    const startIndex = g * memberCount;
    const members = gangCriminals.slice(startIndex, startIndex + memberCount);
    
    // Assign shared assets
    const sharedVehicles = getRandomElements(vehicleDocs, getRandomInt(2, 3)).map(v => v._id);
    const sharedPhones = getRandomElements(phoneDocs, getRandomInt(3, 4)).map(p => p._id);
    const sharedAccounts = getRandomElements(bankDocs, getRandomInt(2, 3)).map(a => a._id);
    
    // Apply shared assets to gang members
    members.forEach(member => {
      // Merge shared assets (avoiding duplicates)
      member.phoneNumbers = [...new Set([...member.phoneNumbers, ...sharedPhones])];
      member.bankAccounts = [...new Set([...member.bankAccounts, ...sharedAccounts])];
      // Track gang tag in aliases for verification/linking
      member.aliases.push(gangConfig.name);
    });

    gangs.push({
      name: gangConfig.name,
      members,
      sharedVehicles,
      sharedPhones,
      sharedAccounts
    });
  }

  // 2. REPEAT OFFENDERS POOL
  // 20% of criminals should appear in multiple FIRs.
  const repeatOffendersCount = Math.floor(criminalDocs.length * 0.20);
  const repeatOffenders = getRandomElements(criminalDocs, repeatOffendersCount);

  // Map to get acts and sections easily
  const categoryMap = {};
  categoryDocs.forEach(c => {
    const origConfig = CRIME_CATEGORIES.find(oc => oc.name === c.name) || CRIME_CATEGORIES[0];
    categoryMap[c.code] = {
      actsAndSections: origConfig.modusOperandi.map(() => {
        // Map realistic Acts/Sections based on category
        switch (c.code) {
          case 'THF': return { act: 'BNS', section: '303' };
          case 'ROB': return { act: 'BNS', section: '309' };
          case 'CYB': return { act: 'IT Act', section: '66D' };
          case 'FRD': return { act: 'BNS', section: '318' };
          case 'AST': return { act: 'BNS', section: '115' };
          case 'MUR': return { act: 'BNS', section: '103' };
          case 'DRG': return { act: 'NDPS Act', section: '20' };
          case 'KDN': return { act: 'BNS', section: '140' };
          case 'EXT': return { act: 'BNS', section: '308' };
          default: return { act: 'BNS', section: '498' };
        }
      }),
      modusOperandi: origConfig.modusOperandi
    };
  });

  // Track FIR counters per station per year to build unique FIR Numbers
  // e.g. FIR/KSP-BLR-HAL-01/2025/0002
  const firCounters = {};

  for (let i = 0; i < count; i++) {
    const station = getRandomElement(stationDocs);
    const category = getRandomElement(categoryDocs);
    
    // Filter investigators belonging to this station (fallback to any investigator, fallback to any user)
    let investigator = userDocs.find(u => u.role === 'Investigator' && u.policeStation?.toString() === station._id.toString());
    if (!investigator) investigator = userDocs.find(u => u.role === 'Investigator');
    if (!investigator) investigator = getRandomElement(userDocs);

    // Pick location belonging to this station
    let location = locationDocs.find(loc => loc.policeStation.toString() === station._id.toString());
    if (!location) location = getRandomElement(locationDocs);

    // Select temporal date (2024 - 2026) with seasonal spikes
    const reportedDate = generateTimelineDate(category.code);
    const incidentDate = new Date(reportedDate.getTime() - getRandomInt(2 * 3600 * 1000, 5 * 24 * 3600 * 1000));
    
    const year = reportedDate.getFullYear();
    const counterKey = `${station.stationCode}_${year}`;
    firCounters[counterKey] = (firCounters[counterKey] || 0) + 1;
    const firNumber = `FIR/${station.stationCode}/${year}/${firCounters[counterKey]}`;

    // SUSPECTS SELECTION
    let suspects = [];
    let suspectsSharedVehicles = [];
    
    // Determine if it is a gang-related FIR (15% chance, if gangs exist)
    const isGangCrime = Math.random() < 0.15 && gangs.length > 0;
    
    if (isGangCrime) {
      const gang = getRandomElement(gangs);
      // Gang crimes involve multiple gang members
      const gangMembers = getRandomElements(gang.members, getRandomInt(2, Math.min(gang.members.length, 4)));
      suspects = gangMembers.map(m => m._id);
      suspectsSharedVehicles = gang.sharedVehicles;
    } else {
      // Determine if repeat offender (40% probability to select from repeat offender pool)
      const useRepeatOffender = Math.random() < 0.4 && repeatOffenders.length > 0;
      if (useRepeatOffender) {
        suspects = [getRandomElement(repeatOffenders)._id];
      } else {
        suspects = [getRandomElement(criminalDocs)._id];
      }
    }

    // VICTIMS SELECTION
    const victims = getRandomElements(victimDocs, getRandomInt(1, 2)).map(v => v._id);

    // VEHICLES SELECTION
    let vehicles = [];
    if (isGangCrime && suspectsSharedVehicles.length > 0) {
      vehicles = getRandomElements(suspectsSharedVehicles, getRandomInt(1, 2));
    } else if (Math.random() < 0.3) { // 30% chance of vehicle involvement in normal crimes
      vehicles = [getRandomElement(vehicleDocs)._id];
    }

    // Complainant generation
    const complainantName = `${faker.person.firstName()} ${faker.person.lastName()}`;
    const complainant = {
      name: complainantName,
      contactNumber: generateIndianPhoneNumber(),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, Karnataka`,
      email: `${complainantName.toLowerCase().replace(/ /g, '.')}@gmail.com`.replace(/[^a-z0-9.@-]/g, ''),
    };

    // Acts and sections mapping
    const catConfig = categoryMap[category.code] || { actsAndSections: [{ act: 'IPC', section: '379' }], modusOperandi: ['Theft'] };
    const actAndSec = getRandomElement(catConfig.actsAndSections);
    const facts = `${getRandomElement(catConfig.modusOperandi)}. Incident reported at ${location.locationName} around ${incidentDate.toLocaleTimeString()}. Complainant states that the suspects fled towards the highway. Investigation initiated.`;

    const status = getRandomElement(['Registered', 'Under Investigation', 'Charge-sheeted', 'Closed']);
    
    let closedDetails = undefined;
    if (status === 'Closed') {
      closedDetails = {
        closedDate: new Date(reportedDate.getTime() + getRandomInt(10 * 24 * 3600 * 1000, 60 * 24 * 3600 * 1000)),
        reason: getRandomElement(['Lack of Evidence', 'Compounded', 'False Case', 'Suspect Arrested and Case Solved']),
        summary: 'Detailed final report filed before the magistrate. Case closed.',
      };
    }

    const firId = new mongoose.Types.ObjectId();
    
    // Back-reference: Add FIR ID to criminals
    criminalDocs.forEach(c => {
      if (suspects.includes(c._id)) {
        c.firs.push(firId);
      }
    });

    firs.push({
      _id: firId,
      firNumber,
      policeStation: station._id,
      complainant,
      incidentDateTime: incidentDate,
      reportedDateTime: reportedDate,
      occurrencePlace: {
        description: `Street occurrence near ${location.locationName}`,
        location: location._id,
      },
      crimeCategory: category._id,
      actsAndSections: [actAndSec],
      status,
      briefFacts: facts,
      victims,
      suspects,
      investigatingOfficer: investigator._id,
      evidence: [], // Populated during evidence generation
      vehicles,
      closedDetails,
    });
  }
  
  return firs;
};

/**
 * Generates Evidence documents and updates FIR relationships
 */
export const generateEvidence = (count, firDocs, userDocs) => {
  const evidences = [];
  const items = {
    Physical: ['Blood-stained cloth', 'Lathi used in assault', 'Iron rod', 'Broken padlock', 'Fingerprints from safe door', 'Wallet dropped by suspect', 'Footwear left at crime scene'],
    Digital: ['CCTV footage snippet on USB', 'Mobile phone chat transcripts', 'IP log records', 'Call Detail Records (CDR) printout', 'Hard disk containing phishing software'],
    Documentary: ['Forged land sale deed', 'Fake stamp papers', 'Bank transaction statement showing transfer', 'Altered ledger book'],
    Scientific: ['Fibre samples collected from vehicle', 'Paint chip scrapings'],
    Forensic: ['Autopsy report copy', 'DNA analysis swab', 'Ballistics certificate'],
    Other: ['Anonymous threatening letter', 'Stolen jewelry bag'],
  };

  for (let i = 0; i < count; i++) {
    const fir = getRandomElement(firDocs);
    const category = getRandomElement(Object.keys(items));
    const name = getRandomElement(items[category]);
    const year = fir.reportedDateTime.getFullYear();
    const evidenceId = generateEvidenceId(year);
    
    // Collected by investigating officer or random investigator
    let collector = userDocs.find(u => u._id.toString() === fir.investigatingOfficer.toString());
    if (!collector) collector = getRandomElement(userDocs);

    const collectedDate = new Date(fir.reportedDateTime.getTime() + getRandomInt(12 * 3600 * 1000, 5 * 24 * 3600 * 1000));
    
    const custodyLogs = [
      {
        officer: collector._id,
        action: 'Collected from crime scene',
        date: collectedDate,
        remarks: 'Secured in sealed polythene cover #A1',
      }
    ];

    // 40% chance of second handler in custody
    if (Math.random() < 0.4) {
      const secondOfficer = getRandomElement(userDocs.filter(u => u._id.toString() !== collector._id.toString()));
      if (secondOfficer) {
        custodyLogs.push({
          officer: secondOfficer._id,
          action: 'Transferred to Forensic Lab / Station Locker',
          date: new Date(collectedDate.getTime() + getRandomInt(24 * 3600 * 1000, 3 * 24 * 3600 * 1000)),
          remarks: 'Handed over for chemical analysis/safe storage',
        });
      }
    }

    const evidenceIdObj = new mongoose.Types.ObjectId();
    
    // Add back-reference to FIR evidence array
    fir.evidence.push(evidenceIdObj);

    evidences.push({
      _id: evidenceIdObj,
      evidenceId,
      fir: fir._id,
      name,
      category,
      description: `Item recovered during investigation of case ${fir.firNumber}. Verified and indexed.`,
      collectedBy: collector._id,
      collectedDate,
      storageLocation: `Station Locker Room #L${getRandomInt(1, 10)}`,
      chainOfCustody: custodyLogs,
    });
  }
  return evidences;
};

/**
 * Generates Chat Session documents
 */
export const generateChatSessions = (count, userDocs) => {
  const chatSessions = [];
  const prompts = [
    'Analyze relationships for the Kolar Gold Smugglers gang',
    'List all theft occurrences near Halasuru in April 2025',
    'Show crime category distribution for Bengaluru East',
    'Are there any repeat offenders active in Mysuru?',
    'What is the projected trend for Cyber Crime in 2026?',
    'Identify vehicle links between Robbery suspects',
    'Summarize evidence collected for cyber fraud cases',
    'Generate monthly report for Tumakuru station code KSP-TUM-TWN-01',
  ];

  const responses = [
    'I found a dense connection: 5 suspects share 2 vehicles (KA-01-AB-1024, KA-01-XY-3051) and 3 phone numbers. This suggests an organized crime syndicate.',
    'Halasuru Police Station registered 14 theft cases in April 2025. 8 cases occurred near residential zones, showing a cluster around the lake area.',
    'In Bengaluru East, Theft makes up 28% of cases, followed by Cyber Crime (20%) and Robbery (14%). High-severity cases are concentrated on weekends.',
    'Yes, 3 offenders have 2 or more active warrants and are suspects in multiple outstanding robbery/theft FIRs in Kuvempunagar.',
    'Cyber Crime is predicted to rise by 12% in the second quarter of 2026, primarily driven by vishing scams and task-based online frauds.',
    'Suspect A and Suspect B were both logged driving the same stolen White Scorpio (KA-06-M-1122) in two separate incidents in Tumakuru.',
    'A total of 18 items of digital evidence have been logged, primarily mobile logs, bank statement PDFs, and hard drive images, stored in Locker L2.',
    'Tumakuru Town Station logged 22 cases in the last month. Average resolution time is 18 days, with 5 cases currently charge-sheeted.',
  ];

  for (let i = 0; i < count; i++) {
    const user = getRandomElement(userDocs);
    const title = getRandomElement(prompts);
    
    const messages = [];
    const messageCount = getRandomInt(2, 6);
    
    let baseTime = faker.date.between({ from: '2026-01-01', to: '2026-06-30' }).getTime();

    for (let m = 0; m < messageCount; m++) {
      const isUser = m % 2 === 0;
      messages.push({
        role: isUser ? 'user' : 'model',
        content: isUser ? (m === 0 ? title : getRandomElement(prompts)) : getRandomElement(responses),
        timestamp: new Date(baseTime + m * 5 * 60000),
      });
    }

    chatSessions.push({
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      title,
      messages,
    });
  }
  return chatSessions;
};

/**
 * Generates Audit Log documents
 */
export const generateAuditLogs = (count, userDocs) => {
  const auditLogs = [];
  const actions = [
    { action: 'LOGIN', details: 'User authentication successful.' },
    { action: 'VIEW_DASHBOARD', details: 'Rendered crime analytics summary.' },
    { action: 'VIEW_FIR', details: 'Accessed case details for FIR record.' },
    { action: 'CREATE_FIR', details: 'Registered a new FIR case entry.' },
    { action: 'UPDATE_EVIDENCE', details: 'Updated chain of custody for evidence log.' },
    { action: 'VIEW_NETWORK_GRAPH', details: 'Visualized cytoscape network relationships.' },
    { action: 'EXPORT_REPORT', details: 'Generated PDF case sheet.' },
    { action: 'PREDICT_HOTSPOTS', details: 'Triggered geospatial prediction model.' },
  ];

  for (let i = 0; i < count; i++) {
    // 10% chance of system action (no user log)
    const isSystem = Math.random() < 0.1;
    const user = isSystem ? null : getRandomElement(userDocs);
    const act = getRandomElement(actions);
    
    let details = act.details;
    if (user && act.action === 'VIEW_FIR') {
      details = `User ${user.name} viewed case details.`;
    } else if (user && act.action === 'CREATE_FIR') {
      details = `User ${user.name} registered new FIR entry.`;
    }

    const timestamp = faker.date.between({ from: '2024-01-01', to: '2026-06-30' });

    auditLogs.push({
      _id: new mongoose.Types.ObjectId(),
      user: user ? user._id : null,
      action: act.action,
      details,
      ipAddress: faker.internet.ipv4(),
      timestamp,
    });
  }
  return auditLogs;
};
