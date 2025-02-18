"use client";

import { useParams, useSearchParams } from "next/navigation";
import {
  Box,
  useBreakpointValue,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import ChatList from "@/components/ChatList";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const ChatLayout = ({ children }: LayoutProps) => {
  // Mobile & Desktop specific layout adjustments
  const sidebarWidth = useBreakpointValue({ base: "100%", md: "0px" });
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Color mode adjustments for background colors
  const bgColor = useColorModeValue("gray.50", "gray.800");

  return (
    <Box display="flex" minH="100vh">
      {/* Sidebar: Chat List */}
      <Box
        bg={useColorModeValue("white", "gray.900")}
        color="white"
        boxShadow={{ base: "none", md: "xl" }} // Shadow for desktop
        height="100vh"
      >
        <ChatList />
      </Box>

      {/* Main Content: Chat */}
      <Box
        flex="1"
        bg={bgColor}
        marginLeft={{ base: 0, md: sidebarWidth }} // Avoid overlapping content on desktop
      >
        {children}
      </Box>
    </Box>
  );
};

export default ChatLayout;
