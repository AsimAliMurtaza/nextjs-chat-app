"use client";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import ChatList from "@/components/ChatList";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgColor = useColorModeValue("gray.300", "gray.800");
  return (
    <Flex h="100vh" w="100vw">
      {/* Sidebar - Ensure it takes full height */}
      <Box
        w={{ base: "100%", md: "auto" }}
        h="100vh"
        borderRight="1px solid"
        borderColor={bgColor}
        overflowY="auto"
      >
        <ChatList />
      </Box>

      {/* Main Content - Ensures no black gap */}
      <Box flex="1" h="100vh" overflow="hidden">
        {children}
      </Box>
    </Flex>
  );
}
