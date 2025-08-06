// services/careerRecommendationService.js
const tf = require('@tensorflow/tfjs-node');
const Career = require('../models/Career');

class CareerRecommendationService {
  constructor() {
    this.model = null;
    this.loadModel();
  }
  
  async loadModel() {
    try {
      // Load pre-trained model or use rule-based system
      // this.model = await tf.loadLayersModel('file://./ml-model/career-recommendation-model.json');
      console.log('Career recommendation model loaded');
    } catch (error) {
      console.log('Using rule-based recommendation system');
    }
  }
  
  async getRecommendations(user) {
    if (this.model) {
      return this.getMLRecommendations(user);
    } else {
      return this.getRuleBasedRecommendations(user);
    }
  }
  
  async getRuleBasedRecommendations(user) {
    const { interests, skills, education } = user.profile;
    
    // Career mapping based on interests and skills
    const careerMappings = {
      'mathematics': ['Data Scientist', 'Actuary', 'Financial Analyst', 'Engineer'],
      'science': ['Research Scientist', 'Doctor', 'Engineer', 'Laboratory Technician'],
      'technology': ['Software Developer', 'Cybersecurity Analyst', 'Data Scientist', 'UX Designer'],
      'art': ['Graphic Designer', 'Art Director', 'Animator', 'Interior Designer'],
      'writing': ['Content Writer', 'Journalist', 'Technical Writer', 'Editor'],
      'helping others': ['Teacher', 'Social Worker', 'Counselor', 'Nurse'],
      'business': ['Business Analyst', 'Marketing Manager', 'Entrepreneur', 'Sales Manager']
    };
    
    let recommendedCareers = new Set();
    
    // Add careers based on interests
    interests.forEach(interest => {
      const normalizedInterest = interest.toLowerCase();
      Object.keys(careerMappings).forEach(key => {
        if (normalizedInterest.includes(key)) {
          careerMappings[key].forEach(career => recommendedCareers.add(career));
        }
      });
    });
    
    // Get detailed career information
    const careers = await Career.find({
      title: { $in: Array.from(recommendedCareers) }
    });
    
    // Score careers based on user profile
    const scoredCareers = careers.map(career => ({
      ...career.toObject(),
      matchScore: this.calculateMatchScore(career, user)
    }));
    
    // Sort by match score
    return scoredCareers.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  calculateMatchScore(career, user) {
    let score = 0;
    const { interests, skills, education } = user.profile;
    
    // Interest matching
    interests.forEach(interest => {
      if (career.requiredSkills.some(skill => 
        skill.toLowerCase().includes(interest.toLowerCase())
      )) {
        score += 2;
      }
    });
    
    // Skill matching
    skills.forEach(skill => {
      if (career.requiredSkills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase())
      )) {
        score += 3;
      }
    });
    
    // Education level matching
    if (education && education.level) {
      const educationLevels = {
        'high school': 1,
        'bachelor': 2,
        'master': 3,
        'phd': 4
      };
      
      const userLevel = educationLevels[education.level.toLowerCase()] || 1;
      const careerLevel = educationLevels[career.requiredEducation.level?.toLowerCase()] || 1;
      
      if (userLevel >= careerLevel) {
        score += 1;
      }
    }
    
    return score;
  }
  
  async getCareerDetails(careerName) {
    const career = await Career.findOne({ 
      title: new RegExp(careerName, 'i') 
    });
    
    if (!career) {
      return {
        error: 'Career not found',
        suggestions: await this.getSimilarCareers(careerName)
      };
    }
    
    return career;
  }
  
  async getSimilarCareers(careerName) {
    const careers = await Career.find({
      $or: [
        { title: new RegExp(careerName.split(' ')[0], 'i') },
        { category: new RegExp(careerName, 'i') }
      ]
    }).limit(5);
    
    return careers.map(career => career.title);
  }
}

module.exports = new CareerRecommendationService();
