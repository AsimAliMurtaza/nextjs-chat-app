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
  Spinner,
} from "@chakra-ui/react";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function ChatList() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
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
    <Box bg="gray.900" color="white" h="100vh" overflowY="auto">
      {/* Header */}
      <HStack p={4} justify="space-between" borderBottom="1px solid gray">
        <Text fontSize="xl" fontWeight="bold">
          ChatSphere
        </Text>
        <Button size="sm" colorScheme="red" onClick={() => signOut()}>
          Logout
        </Button>
      </HStack>

      {/* User List */}
      <VStack spacing={0} align="stretch">
        {users.length > 0 ? (
          users.map((user) => (
            <Box
              key={user._id}
              p={4}
              bg={pathname === `/chat/${user._id}` ? "blue.700" : "gray.800"}
              cursor="pointer"
              borderBottom="1px solid gray"
              _hover={{ bg: "blue.700" }}
              onClick={() => router.push(`/chat/${user._id}`)}
            >
              <HStack spacing={3}>
                <Avatar name={user.name} src={user.avatar || ""} />
                <Box flex="1">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{user.username}</Text>
                    {user.isOnline && (
                      <Text fontSize="xs" color="green.400">
                        Online
                      </Text>
                    )}
                  </HStack>
                </Box>
              </HStack>
            </Box>
          ))
        ) : (
          <Text p={4} textAlign="center">
            No users found
          </Text>
        )}
      </VStack>
    </Box>
  );
}
