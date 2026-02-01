/**
 * Socket.io Handler
 * Xử lý realtime chat và notifications
 */

const connectedUsers = new Map(); // Map để lưu userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User join với userId
    socket.on('user:join', (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`👤 User ${userId} joined with socket ${socket.id}`);
        
        // Join vào room riêng của user
        socket.join(`user:${userId}`);
      }
    });

    // User join vào chat room
    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`💬 Socket ${socket.id} joined chat ${chatId}`);
    });

    // User leave chat room
    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`👋 Socket ${socket.id} left chat ${chatId}`);
    });

    // Send message
    socket.on('chat:message', (data) => {
      const { chatId, message } = data;
      // Broadcast message to all users in chat room except sender
      socket.to(`chat:${chatId}`).emit('chat:newMessage', message);
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      const { chatId, userId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit('chat:userTyping', { userId, isTyping });
    });

    // Mark messages as read
    socket.on('chat:read', (data) => {
      const { chatId, userId } = data;
      socket.to(`chat:${chatId}`).emit('chat:messagesRead', { userId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`❌ User ${socket.userId} disconnected`);
      }
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  // Helper function để gửi notification đến user cụ thể
  io.sendNotificationToUser = (userId, notification) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
  };

  // Helper function để gửi message trong chat
  io.sendMessageToChat = (chatId, message) => {
    io.to(`chat:${chatId}`).emit('chat:newMessage', message);
  };

  return io;
};

module.exports = socketHandler;
