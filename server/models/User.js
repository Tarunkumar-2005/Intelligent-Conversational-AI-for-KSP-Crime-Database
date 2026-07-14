import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters.'],
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address.',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters long.'],
      select: false, // Exclude by default in queries
    },
    role: {
      type: String,
      required: [true, 'Role is required.'],
      enum: {
        values: Object.values(ROLES),
        message: 'Invalid role provided. Choose from: ' + Object.values(ROLES).join(', '),
      },
    },
    badgeNumber: {
      type: String,
      required: [true, 'Badge number is required.'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    policeStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
      required: [
        function() {
          return [ROLES.INVESTIGATOR, ROLES.SUPERVISOR].includes(this.role);
        },
        'Police Station is required for Investigators and Supervisors.',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /^(\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please provide a valid Indian mobile number (+91 followed by 10 digits, or just 10 digits).',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving if it has been modified or is new
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password validity
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
