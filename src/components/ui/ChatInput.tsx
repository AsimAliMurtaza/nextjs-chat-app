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
  chatBg: string;
}

export const ChatInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleFileChange,
  chatBg,
}: ChatInputProps) => {
  return (
    <Box bg={chatBg} p={4} shadow="sm" position="relative">
      {showEmojiPicker && (
        <Box position="absolute" bottom="60px" left="10px" zIndex="10">
          <EmojiPicker
            onEmojiClick={(emoji) => setNewMessage(newMessage + emoji.emoji)}
          />
        </Box>
      )}
      <Flex direction={{ base: "column", md: "row" }} align="center" gap={2}>
        <HStack flex="1" w="full">
          <IconButton
            icon={<FaSmile />}
            aria-label="Emoji Picker"
            borderRadius={100}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          <Input
            type="file"
            display="none"
            id="file-upload"
            onChange={handleFileChange}
          />
          <IconButton
            icon={<FaPaperclip />}
            aria-label="Attach File"
            borderRadius={100}
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
  );
};
