import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const server = createServer();
const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId");

  if (userId) {
    clients.set(userId, ws);
    console.log(`User connected: ${userId}`);
  }

  ws.on("message", (message) => {
    try {
      const messageData = JSON.parse(message.toString());
      const recipientSocket = clients.get(messageData.receiver);

      if (recipientSocket) {
        recipientSocket.send(JSON.stringify(messageData)); // Send message to recipient
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    if (userId) {
      clients.delete(userId);
      console.log(`User disconnected: ${userId}`);
    }
  });
});

server.listen(3001, () => {
  console.log("WebSocket Server running on ws://localhost:3001");
});
