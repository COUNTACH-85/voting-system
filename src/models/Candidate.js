import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Candidate name is required'], 
    trim: true 
  },
  party: { 
    type: String, 
    required: [true, 'Party name is required'], 
    trim: true 
  },
  imageUrl: { 
    type: String, 
    default: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Candidate', 
    trim: true 
  },
  campaignMessage: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Campaign message cannot exceed 1000 characters']
  },
  voteCount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false, // Make userId optional
    unique: false    // Remove unique constraint
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Create indexes for efficient queries
candidateSchema.index({ voteCount: -1 });
// Remove unique index on userId

export default mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema); 