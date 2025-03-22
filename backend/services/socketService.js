const socketIO = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.id} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on("send_message", (data) => {
      io.to(`conversation_${data.conversationId}`).emit("new_message", data);
      console.log("New message sent:", data);
    });

    // Handle typing status
    socket.on("typing", (data) => {
      socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle message read status
    socket.on("read_messages", (data) => {
      io.to(`conversation_${data.conversationId}`).emit("messages_read", {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    // Handle user online/offline status
    socket.on("user_online", (userId) => {
      io.emit("user_status", { userId, status: "online" });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
