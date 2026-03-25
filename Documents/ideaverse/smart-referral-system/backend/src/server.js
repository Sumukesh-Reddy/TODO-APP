// backend/src/server.js
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io for real-time notifications
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  // Join user room based on user ID
  socket.on('authenticate', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});