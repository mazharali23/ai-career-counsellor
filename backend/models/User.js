const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profile: {
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [100, 'Age must be less than 100']
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    education: {
      level: {
        type: String,
        enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Other']
      },
      subjects: [String],
      scores: {
        math: { type: Number, min: 0, max: 100 },
        science: { type: Number, min: 0, max: 100 },
        english: { type: Number, min: 0, max: 100 },
        overall: { type: Number, min: 0, max: 100 }
      }
    },
    interests: [String],
    skills: [String],
    languages: [String]
  },
  careerAssessment: {
    completed: { type: Boolean, default: false },
    results: {
      personalityType: String,
      aptitudeScores: Map,
      recommendedCareers: [String]
    }
  },
  progress: {
    coursesEnrolled: [{
      courseId: String,
      courseName: String,
      provider: String,
      enrolledAt: { type: Date, default: Date.now },
      completed: { type: Boolean, default: false },
      completedAt: Date,
      progress: { type: Number, default: 0 }
    }],
    applicationsSubmitted: [{
      type: { type: String, enum: ['scholarship', 'job', 'internship'] },
      title: String,
      organization: String,
      appliedAt: { type: Date, default: Date.now },
      status: { 
        type: String, 
        enum: ['pending', 'reviewing', 'accepted', 'rejected'],
        default: 'pending'
      }
    }],
    goalsAchieved: [{
      goal: String,
      achievedAt: { type: Date, default: Date.now }
    }]
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
