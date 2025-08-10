require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// CORS configuration (apply only once)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-career-counsellor')
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Career Counsellor Backend API',
    version: '1.0.0',
    status: 'Server is running successfully! 🚀'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const careerRoutes = require('./routes/career');
const dashboardRoutes = require('./routes/dashboard');
const opportunityRoutes = require('./routes/opportunities');

// Import controllers
const realTimeChatController = require('./controllers/realTimeChatController');
const realTimeProgressController = require('./controllers/realTimeProgressController');

// Real-time chat routes
app.post('/api/chat/start-session', realTimeChatController.startChatSession);
app.get('/api/chat/stream', realTimeChatController.streamChat);
app.post('/api/chat/function-call', realTimeChatController.handleFunctionCall);

// Progress routes
app.post('/api/progress/track', realTimeProgressController.trackProgress);
app.get('/api/progress/:userId', realTimeProgressController.getProgress);
app.get('/api/progress/stream/:userId', realTimeProgressController.streamProgress);
app.get('/api/progress/leaderboard', realTimeProgressController.getLeaderboard);

// Opportunities routes
app.get('/api/opportunities/stream', (req, res) => {
  const realTimeOpportunityService = require('./services/realTimeOpportunityService');
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const unsubscribe = realTimeOpportunityService.subscribe({
    emit: function(event, data) {
      const message = JSON.stringify(data);
      res.write(`data: ${message}\n\n`);
    }
  });

  req.on('close', unsubscribe);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/opportunities', opportunityRoutes);

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);
  
  socket.on('join_chat', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined chat room`);
  });
  
  socket.on('send_message', async (data) => {
    console.log('💬 Message received:', data);
    // Echo message back for now
    io.to(`user_${data.userId}`).emit('receive_message', {
      sender: 'bot',
      content: `I received your message: "${data.message}". I'm your AI Career Counsellor!`,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed successfully');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️ Forcing server close...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server (ONLY ONE LISTEN CALL)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Loaded ✅' : 'Missing ❌'}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = { app, server, io };
