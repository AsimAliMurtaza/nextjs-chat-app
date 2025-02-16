import { useEffect, useRef, useState } from "react";

export function useWebSocket(userId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server
    ws.current = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    ws.current.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, receivedMessage]);
    };

    ws.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [userId]);

  const sendMessage = (receiver: string, content: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ sender: userId, receiver, content }));
    }
  };

  return { messages, sendMessage };
}
