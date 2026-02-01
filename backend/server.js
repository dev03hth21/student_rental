require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.WEB_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Socket.io
socketHandler(io);
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/user', require('./routes/userProfileRoutes')); // User profile routes (student)
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/host/rooms', require('./routes/hostRoomRoutes'));
app.use('/api/host/dashboard', require('./routes/hostDashboardRoutes'));
app.use('/api/host/call-logs', require('./routes/hostCallLogRoutes'));
app.use('/api/student/dashboard', require('./routes/studentDashboardRoutes'));
app.use('/api/admin/rooms', require('./routes/adminRoomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/viewlogs', require('./routes/viewLogRoutes')); // ViewLog routes
app.use('/api/calllogs', require('./routes/callLogRoutes')); // CallLog routes
app.use('/api/refunds', require('./routes/refundRoutes'));
app.use('/api/map', require('./routes/mapRoutes'));
app.use('/api/admin/reports', require('./routes/adminReportRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Debug: log process exit to diagnose unexpected shutdowns
process.on('exit', (code) => {
  console.warn(`⚠️ Process exiting with code ${code}`);
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.io is ready for connections`);
});

// Only export when required as a module (e.g., for tests) to avoid early process exit when run directly
if (require.main !== module) {
  module.exports = { app, io };
}
