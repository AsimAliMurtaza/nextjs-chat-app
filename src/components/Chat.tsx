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
  useColorModeValue,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

const MotionBox = motion(Box);

const Chat = ({
  recipient,
  recipientName,
  recipientAvatar,
}: {
  recipient: string;
  recipientName: string;
  recipientAvatar?: string;
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id as string | undefined;

  const bgColor = useColorModeValue("gray.100", "gray.900");
  const chatBg = useColorModeValue("white", "gray.800");
  const messageBg = useColorModeValue("blue.500", "blue.400");
  const receivedBg = useColorModeValue("gray.300", "gray.700");

  useEffect(() => {
    if (!userId || !recipient) return;

    fetch(`/api/messages?user1=${userId}&user2=${recipient}`)
      .then((res) => res.json())
      .then((data: Message[]) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch((err) => console.error("Error fetching chat history:", err));

    const socket = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    socket.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        if (
          (receivedMessage.sender === userId &&
            receivedMessage.receiver === recipient) ||
          (receivedMessage.sender === recipient &&
            receivedMessage.receiver === userId)
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

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    scrollToBottom();

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open.");
    }

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
      bg={bgColor}
      color={useColorModeValue("gray.800", "white")}
      borderRadius="lg"
      overflow="hidden"
      shadow="lg"
    >
      {/* Chat Header */}
      <HStack bg={chatBg} p={4} borderBottomWidth={1} shadow="sm" spacing={4}>
        <Avatar name={recipientName} src={recipientAvatar} />
        <Text fontWeight="bold" fontSize="lg">
          {recipientName}
        </Text>
      </HStack>

      {/* Messages */}
      <VStack
        flex="1"
        spacing={4}
        p={4}
        overflowY="auto"
        align="stretch"
        css={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "10px",
          },
        }}
      >
        {messages.map((msg, i) => (
          <MotionBox
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            alignSelf={msg.sender === userId ? "flex-end" : "flex-start"}
          >
            <Box
              bg={msg.sender === userId ? messageBg : receivedBg}
              color="white"
              px={4}
              py={2}
              borderRadius="lg"
              shadow="md"
            >
              <Text fontSize="sm">{msg.message}</Text>
              <Text fontSize="xs" textAlign="right" opacity={0.7}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>
          </MotionBox>
        ))}
        <div ref={chatContainerRef} />
      </VStack>

      {/* Chat Input */}
      <Box bg={chatBg} p={4} borderTopWidth={1} shadow="sm">
        <HStack>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            bg={useColorModeValue("gray.200", "gray.700")}
            borderRadius="full"
            _focus={{ borderColor: "blue.500", bg: useColorModeValue("white", "gray.600") }}
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
