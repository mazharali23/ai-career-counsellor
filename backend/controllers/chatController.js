// controllers/chatController.js
const ChatSession = require('../models/ChatSession');
const User = require('../models/User');
const CareerRecommendationService = require('../services/careerRecommendationService');
const NLPService = require('../services/nlpService');

class ChatController {
  async processMessage(req, res) {
    try {
      const { userId, message, sessionId } = req.body;
      
      // Get or create chat session
      let session = await ChatSession.findOne({ sessionId, userId });
      if (!session) {
        session = new ChatSession({
          userId,
          sessionId,
          messages: []
        });
      }
      
      // Add user message
      session.messages.push({
        sender: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Process message with NLP
      const nlpResult = await NLPService.processMessage(message);
      
      // Generate bot response based on current stage
      const botResponse = await this.generateBotResponse(session, nlpResult, userId);
      
      // Add bot response
      session.messages.push({
        sender: 'bot',
        content: botResponse.content,
        messageType: botResponse.type,
        metadata: {
          intent: nlpResult.intent,
          confidence: nlpResult.confidence,
          entities: nlpResult.entities
        }
      });
      
      // Update session stage if needed
      if (botResponse.nextStage) {
        session.currentStage = botResponse.nextStage;
      }
      
      await session.save();
      
      res.json({
        success: true,
        response: botResponse,
        sessionStage: session.currentStage
      });
      
    } catch (error) {
      console.error('Chat processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing message'
      });
    }
  }
  
  async generateBotResponse(session, nlpResult, userId) {
    const user = await User.findById(userId);
    const stage = session.currentStage;
    
    switch (stage) {
      case 'introduction':
        return this.handleIntroduction(nlpResult, user);
      case 'assessment':
        return this.handleAssessment(nlpResult, user);
      case 'exploration':
        return this.handleExploration(nlpResult, user);
      case 'recommendation':
        return this.handleRecommendation(nlpResult, user);
      default:
        return this.handleFollowup(nlpResult, user);
    }
  }
  
  async handleIntroduction(nlpResult, user) {
    if (!user.profile.interests || user.profile.interests.length === 0) {
      return {
        content: `Hi ${user.name}! I'm here to help you explore career paths that match your interests and skills. Let's start by understanding what you enjoy doing. What subjects or activities do you find most interesting?`,
        type: 'text',
        nextStage: 'assessment'
      };
    }
    
    return {
      content: `Welcome back, ${user.name}! I see you've already shared some interests with me. Would you like to continue exploring career options or update your profile?`,
      type: 'options',
      options: ['Continue exploring careers', 'Update my profile', 'Take career assessment']
    };
  }
  
  async handleAssessment(nlpResult, user) {
    const { intent, entities } = nlpResult;
    
    if (intent === 'share_interests') {
      // Extract interests from entities
      const interests = entities.interests || [];
      user.profile.interests = [...new Set([...user.profile.interests, ...interests])];
      await user.save();
      
      return {
        content: `Great! I've noted that you're interested in ${interests.join(', ')}. Now, tell me about your academic strengths. What subjects do you perform well in?`,
        type: 'text'
      };
    }
    
    if (intent === 'share_skills') {
      const skills = entities.skills || [];
      user.profile.skills = [...new Set([...user.profile.skills, ...skills])];
      await user.save();
      
      return {
        content: `Excellent! Based on what you've shared, I think we have enough information to explore some career options. Let me analyze your profile and suggest some paths that might interest you.`,
        type: 'text',
        nextStage: 'recommendation'
      };
    }
    
    return {
      content: `I'd like to learn more about your skills and interests. Can you tell me about any subjects you excel in or activities you enjoy?`,
      type: 'text'
    };
  }
  
  async handleRecommendation(nlpResult, user) {
    const recommendations = await CareerRecommendationService.getRecommendations(user);
    
    return {
      content: `Based on your interests in ${user.profile.interests.join(', ')} and your skills, here are some career paths I'd recommend for you:`,
      type: 'recommendation',
      recommendations: recommendations.slice(0, 5),
      nextStage: 'exploration'
    };
  }
  
  async handleExploration(nlpResult, user) {
    if (nlpResult.intent === 'career_details') {
      const careerName = nlpResult.entities.career;
      const careerDetails = await CareerRecommendationService.getCareerDetails(careerName);
      
      return {
        content: `Here's detailed information about ${careerName}:`,
        type: 'career_details',
        careerDetails: careerDetails
      };
    }
    
    return {
      content: `Would you like to learn more about any of these careers, or shall I help you find educational opportunities and scholarships?`,
      type: 'options',
      options: ['Learn more about careers', 'Find educational opportunities', 'Explore scholarships']
    };
  }
  
  async handleFollowup(nlpResult, user) {
    return {
      content: `Is there anything else I can help you with regarding your career planning?`,
      type: 'text'
    };
  }
}

module.exports = new ChatController();
