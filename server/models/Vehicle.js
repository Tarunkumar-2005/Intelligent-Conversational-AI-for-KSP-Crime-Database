import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z]{2}[ -]?\d{2}[ -]?[A-Z]{1,3}[ -]?\d{4}$/,
        'Please provide a valid Indian vehicle registration number (e.g. KA-01-HE-1234 or KA01HE1234).',
      ],
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required.'],
      enum: {
        values: ['Two-Wheeler', 'Three-Wheeler', 'Four-Wheeler', 'HMV', 'Other'],
        message: 'Type must be Two-Wheeler, Three-Wheeler, Four-Wheeler, HMV, or Other.',
      },
      default: 'Four-Wheeler',
    },
    make: {
      type: String,
      required: [true, 'Vehicle make/brand is required.'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required.'],
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required.'],
      trim: true,
    },
    isStolen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
