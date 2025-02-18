"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
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
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue("gray.50", "black");
  const router = useRouter();

  // Landing page content for not authenticated users
  if (!session) {
    return (
      <Box
        minH="100vh"
        bg="gray.900"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="container.md" textAlign="center">
          <VStack spacing={6}>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              bgClip="text"
            >
              Welcome to ChatVerse
            </Heading>
            <Text fontSize="lg" color="gray.300">
              Connect with friends instantly. Secure, fast, and real-time
              messaging.
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (session && status === "authenticated") {
    router.push("/web/conversations");
  }
}
