"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Box } from "@chakra-ui/react";
import Chat from "@/components/Chat";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get("name") || "Unknown User";

  if (!id) {
    return <Box>Select a user to chat</Box>;
  }

  return <Chat recipient={id} recipientName={recipientName} />;
};

export default ChatPage;
