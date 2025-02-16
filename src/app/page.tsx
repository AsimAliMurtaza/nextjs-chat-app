"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Text,
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
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue("gray.50", "black");
  const router = useRouter();

  // Fetch users after authentication
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          setTimeout(() => setIsLoading(false), 500); // Smooth transition delay
        });
    }
  }, [status]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login");
    }
  }, [session, status, router]);

  // **Loading Screen with Windows 10-Style Spinner**
  if (isLoading || status === "loading") {
    return (
      <Flex
        h="100vh"
        align="center"
        justify="center"
        bg={useColorModeValue("white", "black")}
        flexDirection="column"
        transition="opacity 0.3s ease-in-out"
      >
        <Text fontSize="md" mb={3} color="gray.500">
          Loading your chats...
        </Text>
        <Spinner
          thickness="4px"
          speed="0.8s"
          emptyColor="gray.200"
          color="green.500"
          size="xl"
        />
      </Flex>
    );
  }

  return (
    <Flex
      h="100vh"
      opacity={isLoading ? 0 : 1}
      transition="opacity 0.3s ease-in-out"
    >
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
