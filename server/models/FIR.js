import mongoose from 'mongoose';

const complainantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Complainant name is required.'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Complainant contact number is required.'],
      trim: true,
      match: [
        /^(\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please provide a valid Indian mobile number.',
      ],
    },
    address: {
      type: String,
      required: [true, 'Complainant address is required.'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address.',
      ],
    },
  },
  { _id: false }
);

const actSectionSchema = new mongoose.Schema(
  {
    act: {
      type: String,
      required: [true, 'Act name is required (e.g., IPC, BNS).'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Section number is required (e.g., 302, 379).'],
      trim: true,
    },
  },
  { _id: false }
);

const occurrencePlaceSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Detailed location description of occurrence is required.'],
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeLocation',
      required: [true, 'Reference to crime location coordinates is required.'],
    },
  },
  { _id: false }
);

const closedDetailsSchema = new mongoose.Schema(
  {
    closedDate: {
      type: Date,
    },
    reason: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const firSchema = new mongoose.Schema(
  {
    firNumber: {
      type: String,
      required: [true, 'FIR number is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
      match: [
        /^FIR\/[A-Z0-9\-]+\/\d{4}\/\d+$/,
        'FIR number must follow the format FIR/STATION-CODE/YEAR/NUMBER (e.g., FIR/KSP-BLR-01/2026/0001).',
      ],
    },
    policeStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
      required: [true, 'Police station is required.'],
      index: true,
    },
    complainant: {
      type: complainantSchema,
      required: [true, 'Complainant details are required.'],
    },
    incidentDateTime: {
      type: Date,
      required: [true, 'Date and time of incident occurrence is required.'],
    },
    reportedDateTime: {
      type: Date,
      required: [true, 'Date and time of reporting is required.'],
      default: Date.now,
      index: true,
    },
    occurrencePlace: {
      type: occurrencePlaceSchema,
      required: [true, 'Place of occurrence is required.'],
    },
    crimeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeCategory',
      required: [true, 'Crime category is required.'],
      index: true,
    },
    actsAndSections: {
      type: [actSectionSchema],
      required: [true, 'At least one Act and Section is required.'],
      validate: {
        validator: function(val) {
          return val && val.length > 0;
        },
        message: 'At least one Act and Section must be specified.',
      },
    },
    status: {
      type: String,
      required: [true, 'FIR status is required.'],
      enum: {
        values: ['Registered', 'Under Investigation', 'Charge-sheeted', 'Closed', 'Abated', 'Quashed'],
        message: 'FIR status must be Registered, Under Investigation, Charge-sheeted, Closed, Abated, or Quashed.',
      },
      default: 'Registered',
      index: true,
    },
    briefFacts: {
      type: String,
      required: [true, 'Brief facts of the case are required.'],
      trim: true,
    },
    victims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Victim',
      },
    ],
    suspects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Criminal',
      },
    ],
    investigatingOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investigating officer is required.'],
      index: true,
    },
    evidence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
    ],
    closedDetails: {
      type: closedDetailsSchema,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes if searching for specific crimes within a date range per station
firSchema.index({ policeStation: 1, reportedDateTime: -1 });
firSchema.index({ status: 1, reportedDateTime: -1 });

const FIR = mongoose.model('FIR', firSchema);

export default FIR;
