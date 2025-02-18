"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import Chat from "@/components/ChatWindow";
import ChatList from "@/components/ChatList";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get("name") || "Unknown User";

  // Mobile & Desktop specific layout adjustments

  return (
    <Box display="flex" minH="100vh">
      {/* Sidebar: Chat List */}
      <Box
        color="white"
      >
        <ChatList />
      </Box>

      {/* Main Content: Chat */}
      <Box flex="1">
        {id ? (
          <Chat recipient={id} recipientName={recipientName} />
        ) : (
          <Box>Select a chat from the list</Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
