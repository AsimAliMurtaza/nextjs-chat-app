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
  Image,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Flex,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import {
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaEllipsisV,
} from "react-icons/fa";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react"; // Emoji picker library

const MotionBox = motion(Box);
const MotionInput = motion(Input);
const MotionButton = motion(IconButton);

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  file?: string; // Base64 file
  fileType?: string; // "image", "video", "document"
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const userId = session?.user?.id as string | undefined;

  const bgColor = useColorModeValue("white", "whiteAlpha.200");
  const chatBg = useColorModeValue("gray.100", "whiteAlpha.200");
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

  const addEmoji = (emojiObject: { emoji: string }) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
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
      <HStack zIndex={100} p={4} shadow="md" spacing={4}>
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
        overflowX="hidden" // Prevent horizontal scrollbar
        align="stretch"
      >
        {messages.map((msg, i) => (
          <MotionBox
            key={i}
            alignSelf={msg.sender === userId ? "flex-end" : "flex-start"}
            position="relative"
            display="flex"
            flexDirection="column"
            maxWidth={{ base: "90%", md: "80%" }} // Adjust width for smaller screens
          >
            <Box
              bg={msg.sender === userId ? messageBg : receivedBg}
              color="white"
              px={4}
              py={2}
              borderRadius="lg"
              position="relative"
            >
              {/* File Attachments */}
              {msg.file && msg.fileType === "image" && (
                <Image
                  src={msg.file}
                  alt="Sent image"
                  maxW="100%"
                  borderRadius="md"
                />
              )}
              {msg.file && msg.fileType === "video" && (
                <video src={msg.file} controls width="100%" />
              )}

              {/* Message Text */}
              <Text fontSize="sm">{msg.message}</Text>

              {/* Timestamp */}
              <Text fontSize="xs" textAlign="right" opacity={0.7}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              {/* Options Menu - Positioned Absolutely */}
              <Box
                position="absolute"
                top="50%"
                right={msg.sender === userId ? "-10px" : "unset"}
                left={msg.sender !== userId ? "2px" : "unset"}
              >
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<FaEllipsisV />}
                    variant="unstyled"
                    size="xs"
                  />
                  <MenuList>
                    <MenuItem
                      color="red.400"
                      sx={{
                        borderRadius: "md",
                      }}
                      onClick={() => {
                        setMessageToDelete(msg._id);
                        onOpen();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Box>
          </MotionBox>
        ))}
        <div ref={chatContainerRef} />
      </VStack>

      {/* Chat Input & Emoji Picker */}
      <Box bg={chatBg} p={4} shadow="sm" position="relative">
        {showEmojiPicker && (
          <Box position="absolute" bottom="60px" left="10px" zIndex="10">
            <EmojiPicker onEmojiClick={addEmoji} />
          </Box>
        )}
        <Flex
          direction={{ base: "column", md: "row" }} // Stack vertically on small screens
          align="center"
          gap={2}
        >
          <HStack flex="1" w="full">
            <IconButton
              icon={<FaSmile />}
              aria-label="Emoji Picker"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
            <input
              type="file"
              style={{ display: "none" }}
              id="file-upload"
              onChange={handleFileChange}
            />
            <IconButton
              icon={<FaPaperclip />}
              aria-label="Attach File"
              onClick={() => document.getElementById("file-upload")?.click()}
            />
            <MotionInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message"
              borderRadius="full"
              flex="1"
            />
          </HStack>
          <MotionButton
            icon={<FaPaperPlane />}
            colorScheme="green"
            borderRadius="full"
            onClick={sendMessage}
            size="md"
          />
        </Flex>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Message
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (messageToDelete) handleDelete(messageToDelete);
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MotionBox>
  );
};

export default Chat;
