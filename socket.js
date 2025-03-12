const { Server } = require("socket.io");

let io; // ตัวแปรเก็บ instance ของ Socket.IO

const initializeSocket = (server, origin_url) => {
  io = new Server(server, {
    cors: {
      origin: origin_url,
    },
    path: "/api/socket.io",
  });
  console.log(io.path()); // Should print '/api/socket.io'

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("newComment", ({ postId, userId }) => {
      console.log(`New comment on post ${postId} by user ${userId}`);
      io.emit(`notify_post_${postId}`, {
        message: "มีคอมเมนต์ใหม่ในโพสต์ของคุณ!",
        postId,
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO ยังไม่ได้ถูก initialize!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
