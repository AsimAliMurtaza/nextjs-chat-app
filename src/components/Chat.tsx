"use client";
import { useEffect, useState } from "react";
import { Box, Input, Button, VStack, Text } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

interface Message {
  sender: string;
  receiver: string;
  message: string; // ✅ Ensure field matches MongoDB schema
  timestamp: string; // ✅ Added timestamp for sorting if needed
}

const Chat = ({ recipient }: { recipient: string }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  // ✅ Fetch chat history when user switches
  useEffect(() => {
    if (!session?.user?.id || !recipient) return;

    console.log("Fetching chat history for:", session.user.id, "and", recipient);

    fetch(`/api/messages?user1=${session.user.id}&user2=${recipient}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched chat history:", data); // ✅ Log response for debugging
        setMessages(data); // ✅ Set messages from DB
      })
      .catch((err) => console.error("Error fetching chat history:", err));

    // ✅ Set up WebSocket for real-time messages
    const socket = new WebSocket(
      `ws://localhost:3001?userId=${session.user.id}`
    );

    socket.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        if (
          (receivedMessage.sender === session.user.id &&
            receivedMessage.receiver === recipient) ||
          (receivedMessage.sender === recipient &&
            receivedMessage.receiver === session.user.id)
        ) {
          setMessages((prev) => [...prev, receivedMessage]); // ✅ Append only new messages
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    socket.onerror = (error) => console.error("WebSocket Error:", error);
    socket.onclose = () => console.log("WebSocket closed.");
    
    setWs(socket);

    return () => {
      socket.close();
    };
  }, [recipient, session?.user?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!session?.user?.id) {
      console.error("User is not authenticated.");
      return;
    }

    const message: Message = {
      sender: session.user.id,
      receiver: recipient,
      message: newMessage,
      timestamp: new Date().toISOString(), // ✅ Ensure timestamp consistency
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Send message via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open.");
    }

    // Save message via API
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify(message),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Failed to send message:", await res.json());
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      <Box
        p={3}
        border="1px solid gray"
        borderRadius="md"
        h="400px"
        overflowY="scroll"
      >
        {messages.map((msg, i) => (
          <Text
            key={i}
            align={msg.sender === session?.user?.id ? "right" : "left"}
          >
            <b>{msg.sender === session?.user?.id ? "You" : recipient}:</b>{" "}
            {msg.message}
          </Text>
        ))}
      </Box>
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <Button onClick={sendMessage}>Send</Button>
    </VStack>
  );
};

export default Chat;
