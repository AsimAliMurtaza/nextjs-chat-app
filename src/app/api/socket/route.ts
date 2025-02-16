import { NextResponse } from "next/server";
import { Server, WebSocketServer, WebSocket } from "ws";

let wss: Server | null = null;
let clients: Set<WebSocket> = new Set();

export async function GET() {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    wss.on("connection", (ws) => {
      clients.add(ws);
      ws.on("message", (message) => {
        clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message);
          }
        });
      });
      ws.on("close", () => clients.delete(ws));
    });
  }
  return NextResponse.json({ message: "WebSocket server running" });
}
