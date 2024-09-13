const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8082 });

// จัดการการเชื่อมต่อ WebSocket
wss.on("connection", (ws) => {
  console.log("connected");

  ws.on("close", () => {
    console.log("disconnected");
  });
});

// แจ้งเตือนผู้ดูแลระบบที่เชื่อมต่อทั้งหมด
exports.notify = function notify(type, message) {
  const data = {
    type: type,
    message: message,
  };

  console.log("notify => ", data);
  wss.clients.forEach((client, index) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log("notify (" + type + ") => " + index);
      client.send(JSON.stringify(data));
    }
  });
};
