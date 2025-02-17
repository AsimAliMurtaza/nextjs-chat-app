// components/MessageItem.tsx
import {
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDisclosure } from "@chakra-ui/react";

const MotionBox = motion(Box);

interface MessageItemProps {
  message: {
    _id: string;
    sender: string;
    message: string;
    timestamp: string;
    file?: string;
    fileType?: string;
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
        borderRadius="lg"
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
        <Text fontSize="sm">{message.message}</Text>

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
          right={message.sender === userId ? "-10px" : "unset"}
          left={message.sender !== userId ? "2px" : "unset"}
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
                sx={{ borderRadius: "md" }}
                onClick={() => {
                  onDelete(message._id);
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
  );
};
