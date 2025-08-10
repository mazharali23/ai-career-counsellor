const aiChatService = require('../services/aiChatService');
const User = require('../models/User');

class RealTimeChatController {
  async startChatSession(req, res) {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const sessionId = await aiChatService.startChatSession(userId, user.profile);
      
      res.json({
        success: true,
        sessionId,
        message: 'Chat session started successfully'
      });
    } catch (error) {
      console.error('Start chat session error:', error);
      res.status(500).json({ error: 'Failed to start chat session' });
    }
  }

  async streamChat(req, res) {
    try {
      const { sessionId, message } = req.body;

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Stream the AI response
      const responseStream = aiChatService.streamChatResponse(sessionId, message);

      for await (const chunk of responseStream) {
        const data = JSON.stringify(chunk);
        res.write(`data: ${data}\n\n`);
      }

      res.write('data: {"type": "stream_end"}\n\n');
      res.end();

    } catch (error) {
      console.error('Stream chat error:', error);
      const errorData = JSON.stringify({
        type: 'error',
        message: 'Failed to process your message'
      });
      res.write(`data: ${errorData}\n\n`);
      res.end();
    }
  }

  async handleFunctionCall(req, res) {
    try {
      const { sessionId, functionName, args } = req.body;
      
      const result = await aiChatService.handleFunctionCall(functionName, args, sessionId);
      
      res.json({
        success: true,
        result
      });
    } catch (error) {
      console.error('Function call error:', error);
      res.status(500).json({ error: 'Function call failed' });
    }
  }
}

module.exports = new RealTimeChatController();
