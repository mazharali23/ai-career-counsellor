const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'options', 'assessment', 'recommendation', 'career_details'],
      default: 'text'
    },
    metadata: {
      intent: String,
      confidence: Number,
      entities: Map,
      options: [String],
      recommendations: [Object],
      careerDetails: Object
    }
  }],
  currentStage: {
    type: String,
    enum: ['introduction', 'assessment', 'exploration', 'recommendation', 'followup'],
    default: 'introduction'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update last activity on message
chatSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
