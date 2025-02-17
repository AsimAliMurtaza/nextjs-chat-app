// components/ChatInput.tsx
import { Box, Flex, HStack, IconButton, Input } from "@chakra-ui/react";
import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const MotionInput = motion(Input);
const MotionButton = motion(IconButton);

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleFileChange,
}: ChatInputProps) => {
  return (
    <Box 
      bg="transparent"  // Transparent background
      backdropFilter="blur(10px)"  // Subtle glass effect
      p={4} 
      shadow="sm" 
      position="relative"
    >
      {showEmojiPicker && (
        <Box position="absolute" bottom="60px" left="10px" zIndex="10">
          <EmojiPicker
            onEmojiClick={(emoji) => setNewMessage(newMessage + emoji.emoji)}
          />
        </Box>
      )}

      <Flex direction={{ base: "column", md: "row" }} align="center" gap={2}>
        <HStack flex="1" w="full">
          {/* Emoji Button */}
          <IconButton
            icon={<FaSmile />}
            aria-label="Emoji Picker"
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.1)"  // Semi-transparent buttons
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />

          {/* File Upload */}
          <Input
            type="file"
            display="none"
            id="file-upload"
            onChange={handleFileChange}
          />
          <IconButton
            icon={<FaPaperclip />}
            aria-label="Attach File"
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.1)"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            onClick={() => document.getElementById("file-upload")?.click()}
          />

          {/* Chat Input Field */}
          <MotionInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            borderRadius="full"
            flex="1"
            bg="rgba(255, 255, 255, 0.1)"  // Subtle transparent input field
            color="white"
            _placeholder={{ color: "gray.300" }}
            _focus={{ bg: "rgba(255, 255, 255, 0.2)", borderColor: "green.300" }}
          />
        </HStack>

        {/* Send Button */}
        <MotionButton
          icon={<FaPaperPlane />}
          colorScheme="green"
          borderRadius="full"
          onClick={sendMessage}
          size="md"
        />
      </Flex>
    </Box>
  );
};
