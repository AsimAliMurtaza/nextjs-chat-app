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

  return <ChatList />;
}
