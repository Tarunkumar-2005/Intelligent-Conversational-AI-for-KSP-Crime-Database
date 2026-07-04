import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Geospatial coordinates [longitude, latitude] are required.'],
      validate: {
        validator: function(val) {
          return (
            Array.isArray(val) &&
            val.length === 2 &&
            val[0] >= -180 &&
            val[0] <= 180 &&
            val[1] >= -90 &&
            val[1] <= 90
          );
        },
        message: 'Coordinates must be valid: [longitude (-180 to 180), latitude (-90 to 90)].',
      },
    },
  },
  { _id: false }
);

const physicalDescriptionSchema = new mongoose.Schema(
  {
    heightCm: {
      type: Number,
      min: [50, 'Height must be reasonable.'],
      max: [250, 'Height must be reasonable.'],
    },
    build: {
      type: String,
      enum: {
        values: ['Lean', 'Medium', 'Athletic', 'Heavy', 'Obese'],
        message: 'Build must be Lean, Medium, Athletic, Heavy, or Obese.',
      },
    },
    eyeColor: {
      type: String,
      trim: true,
    },
    hairColor: {
      type: String,
      trim: true,
    },
    distinguishingMarks: {
      type: [String], // e.g. "scar on left arm", "tattoo of tiger on back"
      default: [],
    },
  },
  { _id: false }
);

const lastKnownLocationSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: pointSchema,
    },
  },
  { _id: false }
);

const criminalSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required.'],
      enum: {
        values: ['Male', 'Female', 'Transgender', 'Other'],
        message: 'Gender must be Male, Female, Transgender, or Other.',
      },
    },
    dateOfBirth: {
      type: Date,
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    physicalDescription: {
      type: physicalDescriptionSchema,
    },
    modusOperandi: {
      type: [String], // e.g. "Chain snatching", "Phishing scams"
      default: [],
    },
    status: {
      type: String,
      required: [true, 'Criminal status is required.'],
      enum: {
        values: ['Active', 'In Custody', 'Absconding', 'Deceased', 'Acquitted', 'Under Trial'],
        message: 'Status must be Active, In Custody, Absconding, Deceased, Acquitted, or Under Trial.',
      },
      default: 'Active',
      index: true,
    },
    phoneNumbers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhoneNumber',
        index: true,
      },
    ],
    bankAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount',
        index: true,
      },
    ],
    firs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FIR',
        index: true,
      },
    ],
    lastKnownLocation: {
      type: lastKnownLocationSchema,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to calculate age
criminalSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return undefined;
  const diff = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Configure schemas to include virtuals in output json/objects
criminalSchema.set('toJSON', { virtuals: true });
criminalSchema.set('toObject', { virtuals: true });

// Create text index for name and alias lookups
criminalSchema.index({ firstName: 'text', lastName: 'text', aliases: 'text' });

// Create 2dsphere index for lastKnownLocation if specified
criminalSchema.index({ 'lastKnownLocation.location': '2dsphere' });

const Criminal = mongoose.model('Criminal', criminalSchema);

export default Criminal;
