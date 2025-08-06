const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const careerRoutes = require('./routes/career');
const dashboardRoutes = require('./routes/dashboard');
const opportunityRoutes = require('./routes/opportunities');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Career Counsellor Backend API',
    version: '1.0.0',
    status: 'Server is running successfully! 🚀'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/opportunities', opportunityRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-career-counsellor')
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
});

const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

module.exports = app;
