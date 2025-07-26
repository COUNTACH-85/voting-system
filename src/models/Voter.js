import mongoose from 'mongoose';

const voterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for voter'],
    unique: true
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  votedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    default: null
  },
  votedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
voterSchema.index({ userId: 1 }, { unique: true });
voterSchema.index({ hasVoted: 1 });

export default mongoose.models.Voter || mongoose.model('Voter', voterSchema); 