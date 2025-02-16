"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Avatar,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(IconButton);

interface Message {
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

const Chat = ({
  recipient,
  recipientName,
  recipientAvatar,
}: {
  recipient: string;
  recipientName: string;
  recipientAvatar?: string;
}) => {
  interface CustomSessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface CustomSession {
    user?: CustomSessionUser;
  }

  const { data: session } = useSession() as { data: CustomSession | null };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id as string | undefined;

  const bgColor = useColorModeValue("white", "black");
  const chatBg = useColorModeValue("gray.100", "black");
  const messageBg = useColorModeValue("blue.500", "blue.400");
  const receivedBg = useColorModeValue("gray.700", "gray.600");

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
    <MotionBox
      display="flex"
      flexDirection="column"
      h="100vh"
      w="auto"
      bg={bgColor}
      color={useColorModeValue("gray.800", "white")}
      overflow="hidden"
      shadow="lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chat Header */}
      <HStack
        bg={chatBg}
        p={4}
        shadow="sm"
        spacing={4}
        as={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Avatar name={recipientName} src={recipientAvatar} />
        <Text fontWeight="normal" fontSize="xl">
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
              shadow="sm"
            >
              <Text fontSize="sm" fontWeight="thin">
                {msg.message}
              </Text>
              <Text fontSize="xs" textAlign="right" opacity={0.5}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>
          </MotionBox>
        ))}
        <div ref={chatContainerRef} />
      </VStack>

      {/* Chat Input */}
      <Box bg={chatBg} p={4} shadow="sm">
        <HStack>
          <MotionInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message"
            bg={useColorModeValue("gray.200", "whiteAlpha.100")}
            borderRadius="full"
            _focus={{
              bg: useColorModeValue("white", "whiteAlpha.100"),
            }}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileFocus={{ scale: 1.02 }}
          />
          <MotionButton
            aria-label="Send message"
            icon={<FaPaperPlane />}
            colorScheme="green"
            borderRadius="full"
            onClick={sendMessage}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          />
        </HStack>
      </Box>
    </MotionBox>
  );
};

export default Chat;
