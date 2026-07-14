import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: {
        values: ['user', 'model', 'assistant'],
        message: 'Role must be user, model, or assistant.',
      },
      required: true,
      default: 'user'
    },
    sender: {
      type: String,
      enum: {
        values: ['user', 'model', 'assistant'],
        message: 'Sender must be user, model, or assistant.',
      },
      required: true,
      default: 'user'
    },
    content: {
      type: String,
      required: [true, 'Message content is required.'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    }
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User associated with chat session is required.'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'New Investigation'
    },
    status: {
      type: String,
      enum: ['active', 'soft-deleted'],
      default: 'active',
      index: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual property for 'lastUpdated' alias to 'updatedAt'
chatSessionSchema.virtual('lastUpdated').get(function () {
  return this.updatedAt;
});

// Configure JSON serialization to include virtual properties
chatSessionSchema.set('toJSON', { virtuals: true });
chatSessionSchema.set('toObject', { virtuals: true });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
