const express = require('express');
const ChatSession = require('../models/ChatSession');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid'); // You may need to install uuid: npm install uuid
const router = express.Router();

// Start or get chat session
router.post('/session', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find active session or create new one
    let session = await ChatSession.findOne({ 
      userId, 
      isActive: true 
    });

    if (!session) {
      session = new ChatSession({
        userId,
        sessionId: uuidv4(),
        messages: [{
          sender: 'bot',
          content: 'Hello! I\'m your AI Career Counsellor. I\'m here to help you explore career paths that match your interests and skills. What would you like to discuss today?',
          messageType: 'text',
          timestamp: new Date()
        }]
      });
      await session.save();
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      messages: session.messages,
      currentStage: session.currentStage
    });

  } catch (error) {
    console.error('Chat session error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating chat session', 
      error: error.message 
    });
  }
});

// Send message
router.post('/message', auth, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Session ID and message are required' 
      });
    }

    // Find session
    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat session not found' 
      });
    }

    // Add user message
    session.messages.push({
      sender: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate AI response (simplified for now)
    const botResponse = await generateBotResponse(message, session, userId);

    // Add bot response
    session.messages.push({
      sender: 'bot',
      content: botResponse.content,
      messageType: botResponse.type,
      timestamp: new Date(),
      metadata: botResponse.metadata
    });

    // Update session stage if needed
    if (botResponse.nextStage) {
      session.currentStage = botResponse.nextStage;
    }

    await session.save();

    res.json({
      success: true,
      response: botResponse,
      sessionStage: session.currentStage,
      messages: session.messages
    });

  } catch (error) {
    console.error('Message processing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing message', 
      error: error.message 
    });
  }
});

// Simple bot response generator (can be enhanced with NLP later)
async function generateBotResponse(message, session, userId) {
  const user = await User.findById(userId);
  const lowerMessage = message.toLowerCase();

  // Basic keyword matching
  if (lowerMessage.includes('interest') || lowerMessage.includes('like') || lowerMessage.includes('enjoy')) {
    return {
      content: "That's great! Understanding your interests is key to finding the right career path. Can you tell me more about what specifically interests you? For example, do you enjoy working with technology, helping people, being creative, or solving problems?",
      type: 'text',
      nextStage: 'assessment'
    };
  }

  if (lowerMessage.includes('skill') || lowerMessage.includes('good at')) {
    return {
      content: "Excellent! Your skills are valuable assets. What are some things you feel you're particularly good at? This could be anything from academic subjects to personal qualities like leadership or creativity.",
      type: 'text',
      nextStage: 'assessment'
    };
  }

  if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
    return {
      content: "I'd love to help you explore career options! Based on what we discuss, I can suggest careers that match your profile. What type of work environment appeals to you most?",
      type: 'options',
      metadata: {
        options: [
          'Office/Corporate environment',
          'Creative/Artistic workspace',
          'Healthcare/Helping others',
          'Technology/Innovation',
          'Education/Teaching',
          'Outdoor/Physical work'
        ]
      }
    };
  }

  if (lowerMessage.includes('study') || lowerMessage.includes('education') || lowerMessage.includes('learn')) {
    return {
      content: "Education is important for career development! What level of education are you currently at, and what subjects do you find most engaging?",
      type: 'text',
      nextStage: 'assessment'
    };
  }

  // Default response
  return {
    content: "I understand. Let me help you explore your career options step by step. Would you like to start by telling me about your interests, or would you prefer to take a quick career assessment?",
    type: 'options',
    metadata: {
      options: [
        'Tell you about my interests',
        'Share my skills and strengths',
        'Take a career assessment',
        'Learn about specific careers'
      ]
    }
  };
}

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ 
      userId: req.user.userId 
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      sessions: sessions
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching chat history', 
      error: error.message 
    });
  }
});

module.exports = router;
