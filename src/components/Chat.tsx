"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  HStack,
  Avatar,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { FaPaperPlane } from "react-icons/fa";
import user from "@/models/user";

interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

const Chat = ({ recipient, recipientAvatar }: { recipient: string, recipientAvatar?: string }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id as string | undefined;

  // ✅ Fetch chat history when user switches
  useEffect(() => {
    if (!userId || !recipient) return;

    fetch(`/api/messages?user1=${userId}&user2=${recipient}`)
      .then((res) => res.json())
      .then((data: Message[]) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch((err) => console.error("Error fetching chat history:", err));

    // ✅ WebSocket setup
    const socket = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    socket.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        if (
          (receivedMessage.sender === userId && receivedMessage.receiver === recipient) ||
          (receivedMessage.sender === recipient && receivedMessage.receiver === userId)
        ) {
          setMessages((prev) => [...prev, receivedMessage]);
          scrollToBottom();
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
  }, [recipient, userId]);

  // ✅ Scroll to bottom on new message
  const scrollToBottom = () => {
    setTimeout(() => {
      chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const message: Message = {
      sender: userId,
      receiver: recipient,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    scrollToBottom();

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
        const errorData = await res.json();
        console.error("Failed to send message:", errorData);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="100vh"
      w="100%"
      bg="gray.900"
      color="white"
    >
      {/* Chat Header */}
      <HStack bg="gray.800" p={4} borderBottom="1px solid gray" spacing={4}>
        <Avatar name={recipient} src={recipientAvatar} />
        <Text fontWeight="bold">{recipient}</Text>
      </HStack>

      {/* Messages */}
      <VStack
        flex="1"
        spacing={4}
        p={4}
        overflowY="auto"
        align="stretch"
        css={{
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
          },
        }}
      >
        {messages.map((msg, i) => (
          <Flex
            key={i}
            justify={msg.sender === userId ? "flex-end" : "flex-start"}
          >
            <Box
              bg={msg.sender === userId ? "blue.500" : "gray.700"}
              color="white"
              px={4}
              py={2}
              borderRadius="lg"
              maxW="75%"
            >
              <Text fontSize="sm">{msg.message}</Text>
              <Text fontSize="xs" textAlign="right" opacity={0.7}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>
          </Flex>
        ))}
        <div ref={chatContainerRef} />
      </VStack>

      {/* Chat Input */}
      <Box bg="gray.800" p={4} borderTop="1px solid gray">
        <HStack>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            bg="gray.700"
            borderRadius="full"
            color="white"
            _placeholder={{ color: "gray.400" }}
          />
          <IconButton
            aria-label="Send message"
            icon={<FaPaperPlane />}
            colorScheme="blue"
            borderRadius="full"
            onClick={sendMessage}
          />
        </HStack>
      </Box>
    </Box>
  );
};

export default Chat;
