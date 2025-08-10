const realTimeProgressService = require('../services/realTimeProgressService');

class RealTimeProgressController {
  async trackProgress(req, res) {
    try {
      const { userId, progressData } = req.body;
      
      const updatedProgress = await realTimeProgressService.trackProgress(userId, progressData);
      
      res.json({
        success: true,
        progress: updatedProgress
      });
    } catch (error) {
      console.error('Track progress error:', error);
      res.status(500).json({ error: 'Failed to track progress' });
    }
  }

  async getProgress(req, res) {
    try {
      const { userId } = req.params;
      
      const progress = realTimeProgressService.getUserProgress(userId);
      
      res.json({
        success: true,
        progress
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  }

  async streamProgress(req, res) {
    try {
      const { userId } = req.params;

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Subscribe to progress updates
      const unsubscribe = realTimeProgressService.subscribeToProgress(userId, {
        emit: function(event, data) {
          const message = JSON.stringify(data);
          res.write(`data: ${message}\n\n`);
        }
      });

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`);
      }, 30000);

      // Clean up on close
      req.on('close', () => {
        clearInterval(heartbeat);
        unsubscribe();
      });

    } catch (error) {
      console.error('Stream progress error:', error);
      res.status(500).json({ error: 'Failed to stream progress' });
    }
  }

  async getLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const leaderboard = await realTimeProgressService.getLeaderboard(parseInt(limit));
      
      res.json({
        success: true,
        leaderboard
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  }
}

module.exports = new RealTimeProgressController();
