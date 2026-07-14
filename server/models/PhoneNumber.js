import mongoose from 'mongoose';

const phoneNumberSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      match: [
        /^(\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please provide a valid Indian mobile number (+91 followed by 10 digits, or just 10 digits).',
      ],
    },
    serviceProvider: {
      type: String,
      required: [true, 'Service provider is required.'],
      enum: {
        values: ['Jio', 'Airtel', 'Vodafone Idea', 'BSNL', 'Other'],
        message: 'Invalid service provider. Must be Jio, Airtel, Vodafone Idea, BSNL, or Other.',
      },
      default: 'Other',
    },
    imsi: {
      type: String,
      required: [true, 'IMSI is required.'],
      unique: true,
      trim: true,
      match: [/^\d{15}$/, 'IMSI must be exactly 15 digits.'],
    },
    imei: {
      type: String,
      required: [true, 'IMEI is required.'],
      trim: true,
      match: [/^\d{15}$/, 'IMEI must be exactly 15 digits.'],
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required.'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    activationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

phoneNumberSchema.index({ phoneNumber: 1 });

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

export default PhoneNumber;
