import {
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

const MotionBox = motion(Box);

interface MessageItemProps {
  message: {
    _id: string;
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
    file?: string;
    fileType?: string;
    deletedBy: string[];
  };
  userId: string;
  messageBg: string;
  receivedBg: string;
  onDelete: (messageId: string) => void;
}

export const MessageItem = ({
  message,
  userId,
  messageBg,
  receivedBg,
  onDelete,
}: MessageItemProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleted, setIsDeleted] = useState(false);

  // Handle "Delete for Everyone" action
  const handleDeleteForEveryone = async () => {
    try {
      const response = await fetch("/api/messages/deleteForEveryone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: message._id,
          userId: userId,
        }),
      });

      if (response.ok) {
        // Set message as deleted in UI
        setIsDeleted(true);
        onDelete(message._id); // Optionally remove the message from the UI immediately
      } else {
        console.error("Failed to delete the message for everyone");
      }
    } catch (error) {
      console.error("Error deleting message", error);
    }
  };

  // Conditionally render message text based on deletion status
  const renderMessageText = () => {
    return message.message;
  };

  return (
    <MotionBox
      alignSelf={message.sender === userId ? "flex-end" : "flex-start"}
      position="relative"
      display="flex"
      flexDirection="column"
      maxWidth={{ base: "90%", md: "80%" }}
    >
      <Box
        bg={message.sender === userId ? messageBg : receivedBg}
        color="white"
        px={4}
        py={2}
        borderRadius="2xl"
        position="relative"
      >
        {/* File Attachments */}
        {message.file && message.fileType === "image" && (
          <Image
            src={message.file}
            alt="Sent image"
            maxW="100%"
            borderRadius="md"
          />
        )}
        {message.file && message.fileType === "video" && (
          <video src={message.file} controls width="100%" />
        )}

        {/* Message Text */}
        <Text fontSize="sm">{renderMessageText()}</Text>

        {/* Timestamp */}
        <Text fontSize="xs" textAlign="right" opacity={0.7}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        {/* Options Menu - Positioned Absolutely */}
        <Box
          position="absolute"
          top="50%"
          right={message.sender === userId ? "-8px" : "unset"}
          left={message.sender !== userId ? "4px" : "unset"}
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
              {/* Show delete option only for messages sent by the current user */}
              {message.sender === userId && (
                <MenuItem
                  color="red.400"
                  sx={{ borderRadius: "md" }}
                  onClick={() => {
                    handleDeleteForEveryone(); // Delete the message for everyone
                    onOpen(); // Optionally, you can handle opening any modal
                  }}
                >
                  Delete for Everyone
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Box>
      </Box>
    </MotionBox>
  );
};
