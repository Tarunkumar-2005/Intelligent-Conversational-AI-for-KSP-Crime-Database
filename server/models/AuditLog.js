import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null, // Null indicates system-level actions
    },
    action: {
      type: String,
      required: [true, 'Action name is required.'],
      trim: true,
      index: true,
    },
    details: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Explicitly using timestamp field instead of full mongoose timestamps
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
