// app/ChatList.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  useDisclosure,
  Collapse,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { SidebarHeader } from "../components/ui/SidebarHeader";
import { ContactItem } from "../components/ui/ContactItem";
import { AddContactModal } from "../components/ui/AddContactModal";
import { BottomActions } from "../components/ui/BottomActions";

const MotionBox = motion(Box);

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function ChatList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [contacts, setContacts] = useState<User[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newContact, setNewContact] = useState("");

  // Theme-aware colors
  const bgColor = useColorModeValue("white", "whiteAlpha.300");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const highlightBg = useColorModeValue("gray.100", "whiteAlpha.200");

  // Fetch Contacts
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch("/api/contacts")
        .then((res) => res.json())
        .then((data) =>
          setContacts(data.filter((user: User) => user && user._id))
        )
        .catch((err) => console.error("Error fetching contacts:", err));
    }
  }, [status, session]);

  if (status === "loading") return null;
  if (!session) {
    router.push("/login");
    return null;
  }

  // Function to add a new contact
  const addContact = async () => {
    if (!newContact.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await fetch("/api/addContact", {
        method: "POST",
        body: JSON.stringify({ contactEmail: newContact }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: `${newContact} added to your contacts.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setNewContact("");
        onClose();
      } else {
        toast({
          title: "Error",
          description: data.error || "Could not add contact.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error adding contact:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <MotionBox
      as={motion.div}
      animate={{ width: sidebarOpen ? "240px" : "50px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      minH="100vh"
      bg={bgColor}
      color={textColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Sidebar Header */}
      <SidebarHeader
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        textColor={textColor}
      />

      {/* Contact List */}
      <VStack spacing={1} align="stretch" flex="1">
        {contacts.map((user) => (
          <ContactItem
            key={user._id}
            user={user}
            sidebarOpen={sidebarOpen}
            isActive={pathname === `/conversations/${user._id}`}
            highlightBg={highlightBg}
            cardBg={cardBg}
          />
        ))}
      </VStack>

      {/* Add Contact Button */}
      <Collapse in={sidebarOpen} animateOpacity>
        <HStack p={2} justifyContent="right" borderRadius="md" mx={2} mb={2}>
          <Button
            leftIcon={<FaPlus />}
            size="sm"
            onClick={onOpen}
            variant="outline"
          >
            Add Contact
          </Button>
        </HStack>
      </Collapse>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isOpen}
        onClose={onClose}
        newContact={newContact}
        setNewContact={setNewContact}
        addContact={addContact}
        bgColor={bgColor}
        textColor={textColor}
        cardBg={cardBg}
      />

      {/* Bottom Actions */}
      <BottomActions
        sidebarOpen={sidebarOpen}
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
      />
    </MotionBox>
  );
}
