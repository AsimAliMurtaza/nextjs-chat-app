// app/Chat.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  VStack,
  Box,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ChatHeader } from "../components/ui/ChatHeader";
import { MessageItem } from "../components/ui/MessageItem";
import { ChatInput } from "../components/ui/ChatInput";
import { DeleteConfirmationDialog } from "../components/ui/DeleteConfirmationDialog";

const MotionBox = motion(Box);

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  file?: string;
  fileType?: string;
}

interface ChatProps {
  recipient: string;
  recipientName: string;
  recipientAvatar?: string;
}

export default function Chat({
  recipient,
  recipientName,
  recipientAvatar,
}: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const userId = session?.user?.id as string | undefined;

  const bgColor = useColorModeValue("white", "#242424");
  const messageBg = useColorModeValue("blue.500", "blue.400");
  const receivedBg = useColorModeValue("green.400", "#3f3f3f");

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
    if ((!newMessage.trim() && !selectedFile) || !userId) return;

    let fileBase64 = "";
    let fileType = "";

    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      await new Promise((resolve) => {
        reader.onload = () => {
          fileBase64 = reader.result as string;
          fileType = selectedFile.type.split("/")[0]; // image, video, application
          resolve(true);
        };
      });
    }

    const message: Message = {
      _id: Math.random().toString(36).substr(2, 9),
      sender: userId,
      receiver: recipient,
      message: newMessage,
      timestamp: new Date().toISOString(),
      file: fileBase64 || undefined,
      fileType: fileBase64 ? fileType : undefined,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setSelectedFile(null);
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

  const handleDelete = async (messageId: string) => {
    await fetch("/api/messages/delete", {
      method: "POST",
      body: JSON.stringify({ messageId }),
      headers: { "Content-Type": "application/json" },
    });

    // Remove message from UI
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <MotionBox
      display="flex"
      flexDirection="column"
      h="100vh"
      bg={bgColor}
      color={useColorModeValue("gray.800", "white")}
      overflow="hidden"
      shadow="lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chat Header */}
      <ChatHeader
        recipientName={recipientName}
        recipientAvatar={recipientAvatar}
      />

      {/* Messages */}
      <VStack
        flex="1"
        spacing={4}
        p={4}
        overflowY="auto"
        overflowX="hidden"
        align="stretch"
      >
        {messages.map((msg, i) => (
          <MessageItem
            key={i}
            message={msg}
            userId={userId || ""}
            messageBg={messageBg}
            receivedBg={receivedBg}
            onDelete={(messageId) => {
              setMessageToDelete(messageId);
              onOpen();
            }}
          />
        ))}
        <div ref={chatContainerRef} />
      </VStack>

      {/* Chat Input */}
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleFileChange={handleFileChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        onDelete={() => {
          if (messageToDelete) handleDelete(messageToDelete);
        }}
      />
    </MotionBox>
  );
}
