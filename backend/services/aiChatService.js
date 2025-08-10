const OpenAI = require('openai');
const { EventEmitter } = require('events');

class AICareerChatService extends EventEmitter {
  constructor() {
    super();
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required but not set');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.activeChats = new Map(); // Track active chat sessions
  }

  async startChatSession(userId, userProfile) {
    const sessionId = `chat_${userId}_${Date.now()}`;
    
    // Create personalized system message based on user profile
    const systemMessage = this.createPersonalizedSystemMessage(userProfile);
    
    const chatSession = {
      sessionId,
      userId,
      messages: [{ role: 'system', content: systemMessage }],
      userProfile,
      createdAt: new Date()
    };
    
    this.activeChats.set(sessionId, chatSession);
    return sessionId;
  }

  createPersonalizedSystemMessage(userProfile) {
    const { name, interests, education, location, careerGoals } = userProfile || {};
    
    return `You are an expert AI Career Counsellor helping ${name || 'a student'}. 
    
    USER PROFILE:
    - Interests: ${interests?.join(', ') || 'Not specified'}
    - Education: ${education || 'Not specified'}
    - Location: ${location || 'Not specified'}
    - Career Goals: ${careerGoals || 'Exploring options'}
    
    PERSONALITY: Be encouraging, insightful, and practical. Provide specific, actionable advice.
    
    CAPABILITIES:
    - Career path recommendations
    - Skill development guidance  
    - Job market insights
    - Interview preparation
    - Salary expectations
    - Educational recommendations
    - Industry trends analysis
    
    Always personalize responses based on the user's profile. Be conversational but professional.
    If asked about anything outside career counselling, gently redirect to career-related topics.`;
  }

  async *streamChatResponse(sessionId, userMessage) {
    const session = this.activeChats.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message to session
    session.messages.push({ role: 'user', content: userMessage });

    try {
      // Create streaming completion
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: session.messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
        functions: [
          {
            name: 'getCareerRecommendations',
            description: 'Get personalized career recommendations for the user',
            parameters: {
              type: 'object',
              properties: {
                interests: { type: 'array', items: { type: 'string' } },
                skills: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          {
            name: 'findOpportunities',
            description: 'Find real-time job opportunities and scholarships',
            parameters: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                location: { type: 'string' },
                level: { type: 'string' }
              }
            }
          }
        ]
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullResponse += delta.content;
          yield {
            type: 'text_chunk',
            content: delta.content,
            sessionId
          };
        }
        
        if (delta?.function_call) {
          yield {
            type: 'function_call',
            function_call: delta.function_call,
            sessionId
          };
        }
      }

      // Add assistant response to session
      session.messages.push({ role: 'assistant', content: fullResponse });

      yield {
        type: 'message_complete',
        fullResponse,
        sessionId
      };

    } catch (error) {
      console.error('Chat streaming error:', error);
      yield {
        type: 'error',
        message: 'I apologize, but I encountered an issue. Please try again.',
        sessionId
      };
    }
  }

  async handleFunctionCall(functionName, args, sessionId) {
    const session = this.activeChats.get(sessionId);
    
    switch (functionName) {
      case 'getCareerRecommendations':
        return await this.getPersonalizedRecommendations(args, session.userProfile);
        
      case 'findOpportunities':
        return await this.findLiveOpportunities(args, session.userProfile);
        
      default:
        return { error: 'Unknown function' };
    }
  }

  async getPersonalizedRecommendations(args, userProfile) {
    // Integration with your ML model from previous implementation
    const MLService = require('./mlService');
    
    try {
      const recommendations = await MLService.getCareerRecommendations({
        interests: args.interests || userProfile.interests,
        skills: args.skills || userProfile.skills,
        education: userProfile.education
      });
      
      return {
        success: true,
        recommendations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        error: 'Unable to generate recommendations at the moment',
        timestamp: new Date().toISOString()
      };
    }
  }

  async findLiveOpportunities(args, userProfile) {
    // Integration with real-time opportunities service
    const OpportunityService = require('./realTimeOpportunityService');
    
    try {
      const opportunities = await OpportunityService.findLiveOpportunities({
        field: args.field,
        location: args.location || userProfile.location,
        level: args.level || userProfile.education
      });
      
      return {
        success: true,
        opportunities: opportunities.slice(0, 5), // Top 5 most relevant
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: 'Unable to fetch live opportunities',
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new AICareerChatService();
