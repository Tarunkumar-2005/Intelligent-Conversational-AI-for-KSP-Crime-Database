import { DISTRICTS } from '../constants/karnatakaData.js';

/**
 * Returns a random integer between min and max (inclusive)
 */
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random element from an array
 */
export const getRandomElement = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Returns multiple unique random elements from an array
 */
export const getRandomElements = (arr, count) => {
  if (!arr || arr.length === 0 || count <= 0) return [];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

/**
 * Generates coordinate point [longitude, latitude] clustered around a district center
 * @param {string} districtName 
 * @param {boolean} forceHotspot - if true, clusters tighter to create a clear hotspot
 */
export const generateClusteredCoordinates = (districtName, forceHotspot = false) => {
  const districtKey = districtName.toUpperCase();
  const district = DISTRICTS[districtKey] || DISTRICTS.BENGALURU;
  const [lng, lat] = district.center;

  // Gaussian-like offset or small random offset
  // Hotspot is tighter (within ~2km, standard offset is within ~15km)
  const spread = forceHotspot ? 0.015 : 0.08;
  
  // Box-Muller transform for normal distribution
  const u1 = Math.random() || 0.0001; // Avoid 0
  const u2 = Math.random() || 0.0001;
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2); // mean 0, variance 1
  
  const offsetLat = randStdNormal * (spread / 2);
  const offsetLng = randStdNormal * (spread / 2);

  return {
    type: 'Point',
    coordinates: [
      parseFloat((lng + offsetLng).toFixed(6)),
      parseFloat((lat + offsetLat).toFixed(6)),
    ],
  };
};

/**
 * Generates a date between 2024-01-01 and 2026-06-30
 * with seasonal spikes depending on the crime type:
 * - Cybercrime (CYB) spikes in Dec (Holiday shopping/scams)
 * - Theft (THF) and Robbery (ROB) spike in Apr/May (Summer vacation houses empty)
 * - Drug Crimes (DRG) spike in Sep/Dec (Student festival/New Year seasons)
 */
export const generateTimelineDate = (crimeCategoryCode) => {
  const years = [2024, 2025, 2026];
  // Select year. 2026 is limited up to June (since current date is July 2026)
  const year = getRandomElement(years);
  
  let month = getRandomInt(1, 12);
  if (year === 2026) {
    month = getRandomInt(1, 6); // Up to June 2026
  }

  // Adjust month probability for seasonal spikes
  const rand = Math.random();
  if (rand < 0.6) { // 60% chance to follow seasonal trends
    if (crimeCategoryCode === 'CYB') {
      // Cyber crime spikes in November / December (or May/June)
      month = year === 2026 ? getRandomElement([5, 6]) : getRandomElement([5, 6, 11, 12]);
    } else if (crimeCategoryCode === 'THF' || crimeCategoryCode === 'ROB') {
      // Housebreaking / Theft spikes in April/May (summer travel)
      month = getRandomElement([4, 5]);
    } else if (crimeCategoryCode === 'DRG') {
      // Drug crime spikes in August/September (hostel admissions/festivals) or December
      month = year === 2026 ? getRandomElement([1, 2]) : getRandomElement([8, 9, 12]);
    }
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const day = getRandomInt(1, daysInMonth);
  const hour = getRandomInt(0, 23);
  const minute = getRandomInt(0, 59);
  const second = getRandomInt(0, 59);

  return new Date(year, month - 1, day, hour, minute, second);
};

/**
 * Generate a unique Indian format Vehicle Number
 * e.g., KA-01-AB-1234
 */
let vehicleCounter = 1000;
export const generateVehicleNumber = (districtName) => {
  const districtCodes = {
    'Bengaluru': ['01', '02', '03', '04', '05', '51', '53'],
    'Mysuru': ['09', '55'],
    'Mandya': ['11'],
    'Tumakuru': ['06', '64'],
  };
  const codes = districtCodes[districtName] || ['01'];
  const code = getRandomElement(codes);
  const series = 'ABCDEFGHJKLMNPQRSTUVWXY'.split('');
  const letter1 = getRandomElement(series);
  const letter2 = getRandomElement(series);
  
  vehicleCounter = (vehicleCounter + 1) % 9000;
  const numPart = String(1000 + vehicleCounter);
  
  return `KA-${code}-${letter1}${letter2}-${numPart}`;
};

/**
 * Generate a unique bank account number (11-16 digits)
 */
let accountCounter = 123456789;
export const generateAccountNumber = () => {
  accountCounter += getRandomInt(1, 9);
  return `3099${accountCounter}`;
};

/**
 * Generate a unique IMSI (15 digits)
 */
let imsiCounter = 404450000000000;
export const generateIMSI = () => {
  imsiCounter += getRandomInt(1, 100);
  return String(imsiCounter);
};

/**
 * Generate a unique IMEI (15 digits)
 */
let imeiCounter = 860234000000000;
export const generateIMEI = () => {
  imeiCounter += getRandomInt(1, 100);
  return String(imeiCounter);
};

/**
 * Generate a unique Evidence ID (EVD-YYYY-XXXXX)
 */
let evidenceCounter = 1;
export const generateEvidenceId = (year) => {
  const evId = String(evidenceCounter++).padStart(5, '0');
  return `EVD-${year}-${evId}`;
};

/**
 * Generate standard Indian Phone Number +91[6-9]XXXXXXXX
 */
let phoneCounter = 9886000000;
export const generateIndianPhoneNumber = () => {
  phoneCounter += getRandomInt(1, 19);
  return `+91${phoneCounter}`;
};
