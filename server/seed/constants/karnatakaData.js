export const DISTRICTS = {
  BENGALURU: {
    name: 'Bengaluru',
    center: [77.5946, 12.9716], // [longitude, latitude]
    divisions: ['East', 'West', 'South', 'North', 'Central'],
  },
  MYSURU: {
    name: 'Mysuru',
    center: [76.6394, 12.2958],
    divisions: ['City Division', 'Devaraja Division', 'Narasimharaja Division'],
  },
  MANDYA: {
    name: 'Mandya',
    center: [76.8973, 12.5218],
    divisions: ['Mandya Division', 'Srirangapatna Division', 'Maddur Division'],
  },
  TUMAKURU: {
    name: 'Tumakuru',
    center: [77.1140, 13.3392],
    divisions: ['Tumakuru Division', 'Tiptur Division', 'Madhugiri Division'],
  },
};

export const POLICE_STATIONS = [
  {
    name: 'Halasuru Police Station',
    stationCode: 'KSP-BLR-HAL-01',
    district: 'Bengaluru',
    division: 'East',
    contactNumber: '+919480801201',
    address: 'Halasuru, Bengaluru, Karnataka 560008',
    coordinates: [77.6253, 12.9767],
  },
  {
    name: 'Indiranagar Police Station',
    stationCode: 'KSP-BLR-IND-02',
    district: 'Bengaluru',
    division: 'East',
    contactNumber: '+919480801202',
    address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
    coordinates: [77.6412, 12.9719],
  },
  {
    name: 'Lakshmipuram Police Station',
    stationCode: 'KSP-MYS-LAK-01',
    district: 'Mysuru',
    division: 'City Division',
    contactNumber: '+919480802201',
    address: 'Lakshmipuram, Mysuru, Karnataka 570004',
    coordinates: [76.6472, 12.2995],
  },
  {
    name: 'Kuvempunagar Police Station',
    stationCode: 'KSP-MYS-KUV-02',
    district: 'Mysuru',
    division: 'Devaraja Division',
    contactNumber: '+919480802202',
    address: 'Kuvempunagar, Mysuru, Karnataka 570023',
    coordinates: [76.6212, 12.2885],
  },
  {
    name: 'Mandya Central Police Station',
    stationCode: 'KSP-MNY-CEN-01',
    district: 'Mandya',
    division: 'Mandya Division',
    contactNumber: '+919480803201',
    address: 'Gutalu Road, Mandya, Karnataka 571401',
    coordinates: [76.8995, 12.5241],
  },
  {
    name: 'Maddur Police Station',
    stationCode: 'KSP-MNY-MAD-02',
    district: 'Mandya',
    division: 'Maddur Division',
    contactNumber: '+919480803202',
    address: 'Maddur Town, Mandya District, Karnataka 571428',
    coordinates: [77.0458, 12.5851],
  },
  {
    name: 'Tumakuru Town Police Station',
    stationCode: 'KSP-TUM-TWN-01',
    district: 'Tumakuru',
    division: 'Tumakuru Division',
    contactNumber: '+919480804201',
    address: 'B.H. Road, Tumakuru, Karnataka 572101',
    coordinates: [77.1022, 13.3375],
  },
  {
    name: 'Kyathsandra Police Station',
    stationCode: 'KSP-TUM-KYA-02',
    district: 'Tumakuru',
    division: 'Tumakuru Division',
    contactNumber: '+919480804202',
    address: 'Kyathsandra, Tumakuru, Karnataka 572104',
    coordinates: [77.1485, 13.3282],
  },
];

export const CRIME_CATEGORIES = [
  {
    name: 'Theft',
    code: 'THF',
    description: 'Stealing of personal property, housebreakings, and motor vehicle thefts.',
    severityLevel: 'Medium',
    percentage: 25,
    modusOperandi: [
      'Breaks padlock of locked houses during night hours',
      'Targeting unlocked parked two-wheelers in crowded market areas',
      'Snatching gold chains from women walking on quiet streets',
      'Stealing laptops from parked cars by breaking window glass',
    ],
  },
  {
    name: 'Robbery',
    code: 'ROB',
    description: 'Taking property from a person by force, threat, or intimidation.',
    severityLevel: 'High',
    percentage: 12,
    modusOperandi: [
      'Threatening victims with a knife in isolated pedestrian subways',
      'Cornering victims at ATM vestibules late at night',
      'Intercepting transport vehicles on highways using spikes or fake blockades',
    ],
  },
  {
    name: 'Cyber Crime',
    code: 'CYB',
    description: 'Phishing, identity theft, financial fraud, hacking, and online harassment.',
    severityLevel: 'High',
    percentage: 18,
    modusOperandi: [
      'Vishing calls pretending to be bank managers asking for OTPs',
      'Part-time job scams offering high returns via Telegram channels',
      'Compromising business emails to divert payment transactions',
      'Creating fake social media profiles for extortion using morphed photos',
    ],
  },
  {
    name: 'Fraud & Financial Scams',
    code: 'FRD',
    description: 'Cheating, forgery, land scams, Ponzi schemes, and counterfeit currency.',
    severityLevel: 'Medium',
    percentage: 15,
    modusOperandi: [
      'Selling agricultural lands using forged title deeds and documents',
      'Luring senior citizens into investing in high-yield unregistered chit funds',
      'Presenting counterfeit bank drafts for high-value merchandise',
    ],
  },
  {
    name: 'Assault',
    code: 'AST',
    description: 'Physical violence, causing hurt, brawls, and group clashes.',
    severityLevel: 'Medium',
    percentage: 10,
    modusOperandi: [
      'Assaulting individuals over parking disputes or minor road rage',
      'Political group clashes using clubs and stones during local campaigns',
      'Bar brawls escalating into physical fights',
    ],
  },
  {
    name: 'Murder',
    code: 'MUR',
    description: 'Homicide, contract killing, and crime passionnel.',
    severityLevel: 'Critical',
    percentage: 5,
    modusOperandi: [
      'Contract killing executed by hired gang members using local weapons',
      'Murder for gain after housebreaking in residences of elderly couples',
      'Homicide following family disputes or property litigations',
    ],
  },
  {
    name: 'Drug Crime',
    code: 'DRG',
    description: 'Possession, sale, and trafficking of banned narcotic substances.',
    severityLevel: 'Critical',
    percentage: 6,
    modusOperandi: [
      'Peddling synthetic drugs (MDMA, LSD) to college students near hostels',
      'Smuggling ganja hidden inside vegetable trucks from neighboring states',
      'Distributing narcotics through encrypted messaging apps and dead drops',
    ],
  },
  {
    name: 'Kidnapping',
    code: 'KDN',
    description: 'Abducting individuals for ransom or personal enmity.',
    severityLevel: 'Critical',
    percentage: 4,
    modusOperandi: [
      'Abducting children of businessmen near schools for ransom',
      'Forcible abduction of individuals over unsettled business disputes',
    ],
  },
  {
    name: 'Extortion',
    code: 'EXT',
    description: 'Forcing payments through intimidation, threat of violence or exposure.',
    severityLevel: 'High',
    percentage: 3,
    modusOperandi: [
      'Sending threat messages to local builders demanding haftas (extortion money)',
      'Blackmailing individuals with recorded private video calls',
    ],
  },
  {
    name: 'Domestic Violence',
    code: 'DOM',
    description: 'Abuse, harassment, or cruelty within domestic settings.',
    severityLevel: 'Medium',
    percentage: 2,
    modusOperandi: [
      'Harassment for dowry and domestic abuse by family members',
      'Marital cruelty and physical harassment',
    ],
  },
];

export const GANGS = [
  { name: 'Kolar Gold Smugglers', tag: 'KGS' },
  { name: 'Bengaluru Highway Snatchers', tag: 'BHS' },
  { name: 'Mandya Sand Mafia', tag: 'MSM' },
  { name: 'Mysuru Cyber Syndicate', tag: 'MCS' },
  { name: 'Tumakuru Extortion Syndicate', tag: 'TES' },
];

export const BANKS = [
  { name: 'State Bank of India', code: 'SBIN' },
  { name: 'Canara Bank', code: 'CNRB' },
  { name: 'HDFC Bank', code: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICIC' },
  { name: 'Axis Bank', code: 'UTIB' },
  { name: 'Bank of Baroda', code: 'BARB' },
];

export const MOBILE_PROVIDERS = ['Jio', 'Airtel', 'Vodafone Idea', 'BSNL'];

export const LOCATION_TYPES = ['Residential', 'Commercial', 'Industrial', 'Public Space', 'Highway', 'Other'];

export const VEHICLE_BRANDS = {
  'Two-Wheeler': [
    { make: 'Honda', models: ['Activa', 'CB Shine', 'Unicorn'] },
    { make: 'Hero', models: ['Splendor+', 'HF Deluxe', 'Glamour'] },
    { make: 'TVS', models: ['Jupiter', 'Apache RTR', 'XL100'] },
    { make: 'Royal Enfield', models: ['Classic 350', 'Bullet 350'] },
  ],
  'Three-Wheeler': [
    { make: 'Bajaj', models: ['RE Optima', 'Maxima C'] },
    { make: 'Piaggio', models: ['Ape DX', 'Ape City'] },
  ],
  'Four-Wheeler': [
    { make: 'Maruti Suzuki', models: ['Swift', 'Alto', 'WagonR', 'Ertiga', 'Baleno'] },
    { make: 'Hyundai', models: ['i20', 'Creta', 'Verna'] },
    { make: 'Tata', models: ['Nexon', 'Punch', 'Altroz', 'Harrier'] },
    { make: 'Mahindra', models: ['Bolero', 'Scorpio', 'XUV700', 'Thar'] },
  ],
  'HMV': [
    { make: 'Tata', models: ['LPT 1613', 'Signa 2823'] },
    { make: 'Ashok Leyland', models: ['Dost', 'U-Truck'] },
    { make: 'Eicher', models: ['Pro 2049', 'Pro 3015'] },
  ],
};
