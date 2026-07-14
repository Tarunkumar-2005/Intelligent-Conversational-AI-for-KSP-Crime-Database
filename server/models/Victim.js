import mongoose from 'mongoose';

const victimSchema = new mongoose.Schema(
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
    gender: {
      type: String,
      required: [true, 'Gender is required.'],
      enum: {
        values: ['Male', 'Female', 'Transgender', 'Other'],
        message: 'Gender must be Male, Female, Transgender, or Other.',
      },
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required.'],
      trim: true,
      match: [
        /^(\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please provide a valid Indian mobile number.',
      ],
    },
    address: {
      type: String,
      required: [true, 'Complainant/Victim address is required.'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address.',
      ],
    },
    dateOfBirth: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to calculate age
victimSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return undefined;
  const diff = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

victimSchema.set('toJSON', { virtuals: true });
victimSchema.set('toObject', { virtuals: true });

const Victim = mongoose.model('Victim', victimSchema);

export default Victim;
