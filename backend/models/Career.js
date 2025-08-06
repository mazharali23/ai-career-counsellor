const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Healthcare', 'Education', 'Business', 'Arts', 'Science', 'Engineering', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  requiredSkills: [String],
  requiredEducation: {
    level: {
      type: String,
      enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Certification']
    },
    subjects: [String],
    duration: String
  },
  averageSalary: {
    min: Number,
    max: Number,
    currency: { type: String, default: '$' }
  },
  jobOutlook: {
    growth: String,
    demand: String,
    stability: String
  },
  pathways: [{
    education: String,
    duration: String,
    cost: Number,
    providers: [String]
  }],
  relatedCareers: [String],
  workEnvironment: {
    setting: String,
    schedule: String,
    travelRequired: Boolean,
    teamWork: Boolean
  },
  tags: [String],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create index for searching
careerSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

module.exports = mongoose.model('Career', careerSchema);
