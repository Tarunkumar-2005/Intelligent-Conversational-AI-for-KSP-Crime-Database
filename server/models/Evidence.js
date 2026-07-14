import mongoose from 'mongoose';

const custodyLogSchema = new mongoose.Schema(
  {
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: [true, 'Action description is required.'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const evidenceSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: String,
      required: [true, 'Evidence ID is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^EVD-\d{4}-\d{5}$/, 'Evidence ID must be in format EVD-YYYY-XXXXX.'],
    },
    fir: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FIR',
      required: [true, 'Associated FIR is required.'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Evidence name is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Evidence category is required.'],
      enum: {
        values: ['Physical', 'Digital', 'Documentary', 'Scientific', 'Forensic', 'Other'],
        message: 'Category must be Physical, Digital, Documentary, Scientific, Forensic, or Other.',
      },
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer collecting the evidence is required.'],
    },
    collectedDate: {
      type: Date,
      default: Date.now,
    },
    storageLocation: {
      type: String,
      trim: true,
    },
    chainOfCustody: {
      type: [custodyLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Evidence = mongoose.model('Evidence', evidenceSchema);

export default Evidence;
