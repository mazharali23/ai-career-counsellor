const MLService = require('../services/mlService');
const User = require('../models/User');

class ChatController {
  async processMessage(req, res) {
    try {
      const { userId, message, sessionId } = req.body;
      const user = await User.findById(userId);
      
      // Enhanced NLP processing
      const intent = this.classifyIntent(message);
      const entities = this.extractEntities(message);
      
      let botResponse;
      
      switch (intent) {
        case 'career_recommendation':
          botResponse = await this.handleCareerRecommendation(user, entities);
          break;
        case 'skill_assessment':
          botResponse = await this.handleSkillAssessment(user, entities);
          break;
        case 'interest_exploration':
          botResponse = await this.handleInterestExploration(user, entities);
          break;
        default:
          botResponse = await this.handleGeneralConversation(message, user);
      }
      
      // Save conversation to database
      await this.saveChatMessage(userId, sessionId, message, botResponse);
      
      res.json({
        success: true,
        response: botResponse
      });
      
    } catch (error) {
      console.error('Chat processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing message'
      });
    }
  }
  
  classifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('recommend')) {
      return 'career_recommendation';
    }
    if (lowerMessage.includes('skill') || lowerMessage.includes('ability')) {
      return 'skill_assessment';
    }
    if (lowerMessage.includes('interest') || lowerMessage.includes('like') || lowerMessage.includes('enjoy')) {
      return 'interest_exploration';
    }
    
    return 'general';
  }
  
  async handleCareerRecommendation(user, entities) {
    try {
      if (!user.profile || !user.profile.interests || user.profile.interests.length === 0) {
        return {
          content: "I'd love to help you with career recommendations! First, let me learn about your interests. What subjects or activities do you enjoy most?",
          type: 'question',
          nextSteps: ['collect_interests']
        };
      }
      
      // Get ML-powered recommendations
      const recommendations = await MLService.getCareerRecommendations({
        interests: user.profile.interests,
        skills: user.profile.skills || [],
        education: user.profile.education?.level || 'bachelor'
      });
      
      return {
        content: "Based on your profile, I've found some great career matches for you!",
        type: 'career_recommendations',
        recommendations: recommendations,
        followUp: "Would you like me to explain more about any of these careers, or help you explore the requirements?"
      };
      
    } catch (error) {
      console.error('Career recommendation error:', error);
      return {
        content: "I'm having trouble generating recommendations right now. Let's start by updating your profile with your interests and skills.",
        type: 'fallback'
      };
    }
  }
  
  async handleInterestExploration(user, entities) {
    // Extract interests from user message
    const mentionedInterests = this.extractInterests(entities.originalMessage);
    
    if (mentionedInterests.length > 0) {
      // Update user profile
      const currentInterests = user.profile?.interests || [];
      const updatedInterests = [...new Set([...currentInterests, ...mentionedInterests])];
      
      await User.findByIdAndUpdate(user._id, {
        'profile.interests': updatedInterests
      });
      
      return {
        content: `Great! I've noted that you're interested in ${mentionedInterests.join(', ')}. These interests could lead to exciting career paths. What skills do you feel strongest in?`,
        type: 'interest_confirmation',
        interests: mentionedInterests,
        nextStep: 'collect_skills'
      };
    }
    
    return {
      content: "I'd love to learn about your interests! What subjects, activities, or topics do you find most engaging? For example: technology, art, helping others, science, business, etc.",
      type: 'interest_collection'
    };
  }
  
  extractInterests(message) {
    const interestKeywords = {
      'technology': ['tech', 'technology', 'computer', 'programming', 'coding', 'software'],
      'science': ['science', 'physics', 'chemistry', 'biology', 'research'],
      'math': ['math', 'mathematics', 'numbers', 'statistics', 'calculus'],
      'art': ['art', 'design', 'creative', 'drawing', 'painting', 'visual'],
      'business': ['business', 'entrepreneurship', 'management', 'finance', 'marketing'],
      'helping others': ['helping', 'people', 'community', 'social', 'volunteer'],
      'health': ['health', 'medical', 'doctor', 'nurse', 'healthcare'],
      'education': ['teaching', 'education', 'learning', 'school', 'training']
    };
    
    const foundInterests = [];
    const lowerMessage = message.toLowerCase();
    
    Object.keys(interestKeywords).forEach(interest => {
      if (interestKeywords[interest].some(keyword => lowerMessage.includes(keyword))) {
        foundInterests.push(interest);
      }
    });
    
    return foundInterests;
  }
}

module.exports = new ChatController();
