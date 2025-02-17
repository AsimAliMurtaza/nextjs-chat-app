// components/ChatHeader.tsx
import { HStack, Avatar, Text } from "@chakra-ui/react";

interface ChatHeaderProps {
  recipientName: string;
  recipientAvatar?: string;
}

export const ChatHeader = ({ recipientName, recipientAvatar }: ChatHeaderProps) => {
  return (
    <HStack zIndex={100} p={4} shadow="md" spacing={4}>
      <Avatar name={recipientName} src={recipientAvatar} />
      <Text fontWeight="normal" fontSize="xl">
        {recipientName}
      </Text>
    </HStack>
  );
};