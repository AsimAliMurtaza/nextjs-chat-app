"use client";

import { Box, Flex } from "@chakra-ui/react";
import ChatList from "@/components/ChatList";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex h="100vh">
      {/* Sidebar stays visible */}
      <Box
        w={{ base: "100%", md: "30%" }}
        borderRight="1px solid"
        borderColor="gray.700"
      >
        <ChatList />
      </Box>

      {/* Right Side: Dynamic Chat Content */}
      <Box flex="1" bg="gray.800">
        {children}
      </Box>
    </Flex>
  );
}
