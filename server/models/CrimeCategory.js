import mongoose from 'mongoose';

const crimeCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Crime category name is required.'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Crime category code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    severityLevel: {
      type: String,
      required: [true, 'Severity level is required.'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Severity level must be Low, Medium, High, or Critical.',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const CrimeCategory = mongoose.model('CrimeCategory', crimeCategorySchema);

export default CrimeCategory;
