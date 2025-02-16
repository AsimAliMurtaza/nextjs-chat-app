"use client";

import { useState } from "react";
import { Box, Flex, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import ChatList from "@/components/ChatList";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarWidth = isSidebarOpen ? "280px" : "80px"; // Sidebar width toggle
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box
        w={isMobile ? "100%" : sidebarWidth}
        transition="width 0.3s ease"
        borderRight="1px solid"
        borderColor="gray.700"
        position={isMobile ? "absolute" : "relative"}
        zIndex={isMobile ? "overlay" : "auto"}
      >
        <ChatList />
      </Box>

      {/* Chat Content */}
      <Box flex="1" bg="gray.800">
        {children}
      </Box>

      {/* Toggle Button (Visible on Mobile) */}
      {isMobile && (
        <IconButton
          aria-label="Toggle Sidebar"
          icon={<FaBars />}
          position="absolute"
          top="10px"
          left="10px"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          zIndex="overlay"
          bg="gray.700"
          color="white"
        />
      )}
    </Flex>
  );
}
