"use client";

import { useEffect, useState } from "react";

export default function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ username: string; message: string }[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000/api/socket");

    socket.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, receivedMessage]);
    };

    setWs(socket);
    return () => socket.close();
  }, []);

  const sendMessage = async () => {
    if (!ws || !username || !message) return;

    const newMessage = { username, message };
    ws.send(JSON.stringify(newMessage));

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center mb-4">Real-time Chat</h2>
        {!username ? (
          <div className="flex flex-col">
            <input
              type="text"
              className="p-2 rounded bg-gray-700 text-white mb-2"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="h-64 overflow-y-auto bg-gray-700 p-4 rounded">
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.username}: </strong>
                  {msg.message}
                </p>
              ))}
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                className="flex-grow p-2 rounded bg-gray-700 text-white"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-500 rounded">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
