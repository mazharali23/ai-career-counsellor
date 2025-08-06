// services/nlpService.js
const natural = require('natural');
const compromise = require('compromise');

class NLPService {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }
  
  trainClassifier() {
    // Training data for intent classification
    const trainingData = [
      // Interest sharing
      { text: 'I like mathematics and science', intent: 'share_interests' },
      { text: 'I enjoy coding and programming', intent: 'share_interests' },
      { text: 'I love art and design', intent: 'share_interests' },
      { text: 'I am interested in helping people', intent: 'share_interests' },
      
      // Skill sharing
      { text: 'I am good at problem solving', intent: 'share_skills' },
      { text: 'I have strong communication skills', intent: 'share_skills' },
      { text: 'I am creative and innovative', intent: 'share_skills' },
      
      // Career exploration
      { text: 'Tell me about software engineering', intent: 'career_details' },
      { text: 'What does a doctor do', intent: 'career_details' },
      { text: 'I want to know about teaching', intent: 'career_details' },
      
      // General questions
      { text: 'What careers match my interests', intent: 'get_recommendations' },
      { text: 'Show me job opportunities', intent: 'find_opportunities' },
      { text: 'Help me find scholarships', intent: 'find_scholarships' }
    ];
    
    trainingData.forEach(data => {
      this.classifier.addDocument(data.text, data.intent);
    });
    
    this.classifier.train();
  }
  
  async processMessage(message) {
    const intent = this.classifier.classify(message);
    const confidence = this.getClassificationConfidence(message, intent);
    const entities = this.extractEntities(message);
    
    return {
      intent,
      confidence,
      entities,
      originalMessage: message
    };
  }
  
  getClassificationConfidence(message, intent) {
    const classifications = this.classifier.getClassifications(message);
    const targetClassification = classifications.find(c => c.label === intent);
    return targetClassification ? targetClassification.value : 0;
  }
  
  extractEntities(message) {
    const doc = compromise(message);
    const entities = {};
    
    // Extract interests
    const interestKeywords = [
      'mathematics', 'math', 'science', 'physics', 'chemistry', 'biology',
      'art', 'design', 'music', 'writing', 'literature', 'history',
      'technology', 'coding', 'programming', 'computers',
      'sports', 'fitness', 'health', 'medicine',
      'business', 'economics', 'finance', 'marketing',
      'teaching', 'education', 'helping people', 'social work'
    ];
    
    entities.interests = interestKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    // Extract skills
    const skillKeywords = [
      'problem solving', 'communication', 'leadership', 'teamwork',
      'creative', 'analytical', 'organized', 'detail oriented',
      'public speaking', 'research', 'critical thinking'
    ];
    
    entities.skills = skillKeywords.filter(skill => 
      message.toLowerCase().includes(skill)
    );
    
    // Extract career names
    const careers = doc.match('#Person').out('array'); // Simple career extraction
    entities.career = careers.length > 0 ? careers[0] : null;
    
    // Extract subjects
    const subjects = doc.match('#Noun').out('array');
    entities.subjects = subjects.filter(subject => 
      ['math', 'science', 'english', 'history', 'art'].includes(subject.toLowerCase())
    );
    
    return entities;
  }
}

module.exports = new NLPService();
