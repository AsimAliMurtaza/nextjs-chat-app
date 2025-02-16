"use client";

import { useParams } from "next/navigation";
import { Box } from "@chakra-ui/react";
import Chat from "@/components/Chat";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Box>Select a user to chat</Box>;
  }

  return <Chat recipient={id} />;
};

export default ChatPage;
