import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: [true, 'Account number is required.'],
      unique: true,
      trim: true,
      minlength: [9, 'Account number must be at least 9 digits.'],
      maxlength: [18, 'Account number cannot exceed 18 digits.'],
      match: [/^\d+$/, 'Account number must contain only digits.'],
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required.'],
      trim: true,
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required.'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required.'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide a valid Indian IFSC code (e.g., SBIN0001234).'],
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required.'],
      trim: true,
    },
    accountType: {
      type: String,
      required: [true, 'Account type is required.'],
      enum: {
        values: ['Savings', 'Current', 'Joint'],
        message: 'Account type must be Savings, Current, or Joint.',
      },
      default: 'Savings',
    },
    balance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
