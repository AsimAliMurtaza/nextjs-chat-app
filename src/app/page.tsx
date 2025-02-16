"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, Button, Text, VStack, Spinner, Avatar } from "@chakra-ui/react";

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

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
    <VStack spacing={4} align="stretch">
      <Box p={4} bg="gray.700" borderRadius="md" textAlign="center">
        <Text fontSize="xl">Hello, {session.user?.email}!</Text>
        <Button mt={2} onClick={() => signOut()}>
          Logout
        </Button>
      </Box>

      <Text fontSize="lg">Select a user to chat with:</Text>
      {users.length > 0 ? (
        users.map((user) => (
          <Box
            key={user._id}
            p={3}
            border="1px solid gray"
            borderRadius="md"
            cursor="pointer"
            onClick={() => router.push(`/chat/${user._id}`)}
            display="flex"
            alignItems="center"
          >
            <Avatar name={user.name} mr={3} />
            <Text>{user.email}</Text>
          </Box>
        ))
      ) : (
        <Text>No users found</Text>
      )}
    </VStack>
  );
}
