import { NextRequest } from "next/server";
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ noServer: true });
const clients = new Map<string, WebSocket>(); // Store connected clients

export async function GET(req: NextRequest) {
  if (!req.nextUrl.searchParams.has("upgrade")) {
    return new Response("WebSocket Upgrade Required", { status: 426 });
  }

  const { socket } = (req as any).headers.get("upgrade");

  if (socket) {
    wss.handleUpgrade(req, socket, Buffer.alloc(0), (ws) => {
      wss.emit("connection", ws, req);
    });
  }

  wss.on("connection", (ws, req) => {
    const userId = new URL(req.url!, `http://${req.headers.host}`).searchParams.get("userId");
    
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on("message", (data) => {
      const messageData = JSON.parse(data.toString());

      const recipientSocket = clients.get(messageData.receiver);
      if (recipientSocket) {
        recipientSocket.send(JSON.stringify(messageData));
      }
    });

    ws.on("close", () => {
      if (userId) clients.delete(userId);
    });
  });

  return new Response(null, { status: 101 });
}
