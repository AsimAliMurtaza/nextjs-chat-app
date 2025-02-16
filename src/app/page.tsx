"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  Flex,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import ChatList from "@/components/ChatList";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const bgColor = useColorModeValue("gray.50", "black");
  const cardBg = useColorModeValue("white", "black");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const highlightBg = useColorModeValue("gray.100", "blue.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const router = useRouter();
  const pathname = usePathname(); // Get current route

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users")
        .then((res) => res.json())
        .then(setUsers);
    }
  }, [status]);

  if (status === "loading") {
    return <Spinner size="xl" />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <Flex h="100vh">
      {/* Sidebar - Chat List */}
      <Box w={{ base: "100%", md: "auto" }} maxW="300px">
        <ChatList />
      </Box>

      {/* Right Side - Welcome Message */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bgColor}
      >
        <Text fontSize="xl" color="gray.400">
          Select a chat to start messaging
        </Text>
      </Box>
    </Flex>
  );
}
