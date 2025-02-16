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
  IconButton,
  useToast,
  useColorModeValue,
  useColorMode,
  Flex,
  Tooltip,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { FaBars, FaSignOutAlt, FaMoon, FaSun, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

// Motion Wrapper for Smooth Animations
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
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const highlightBg = useColorModeValue("blue.500", "blue.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  // Fetch Contacts
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch("/api/contacts")
        .then((res) => res.json())
        .then((data) => setContacts(data.filter((user) => user && user._id)))
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
      w={sidebarOpen ? "280px" : "80px"}
      minH="100vh"
      bg={bgColor}
      color={textColor}
      borderRight="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* ✅ Sidebar Header */}
      <Flex justify="space-between" align="center" p={4}>
        {sidebarOpen && (
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, blue.400, purple.400)"
            bgClip="text"
          >
            ChatSphere
          </Text>
        )}
        <IconButton
          icon={<FaBars />}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
          variant="ghost"
          fontSize="lg"
        />
      </Flex>

      {/* ✅ Sidebar Contacts Section */}
      <Collapse in={sidebarOpen} animateOpacity>
        <HStack bg="gray.800" p={3} borderRadius="md" mx={2} mb={2}>
          <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue" onClick={onOpen}>
            Add Contact
          </Button>
        </HStack>
      </Collapse>

      {/* ✅ Modal for Adding Contact */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.900" color="white">
          <ModalHeader>Add New Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter contact email..."
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              bg="gray.800"
              color="white"
              _placeholder={{ color: "gray.500" }}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={addContact}>
              Add Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ✅ Contact List */}
      <VStack spacing={1} align="stretch" flex="1" overflowY="auto">
        {contacts.map((user) => (
          <Tooltip label={user.username} placement="right" hasArrow isDisabled={sidebarOpen} key={user._id}>
            <MotionBox
              p={sidebarOpen ? 4 : 2}
              bg={pathname === `/chat/${user._id}` ? highlightBg : cardBg}
              cursor="pointer"
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
              boxShadow="md"
              whileHover={{ scale: 1.02 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={() => router.push(`/chat/${user._id}?name=${encodeURIComponent(user.username)}`)}
            >
              <HStack spacing={3} w="full">
                <Avatar name={user.username} src={user.avatar || ""} size={sidebarOpen ? "md" : "sm"} />
                <Collapse in={sidebarOpen} animateOpacity>
                  <Box>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{user.username}</Text>
                      {user.isOnline && <Text fontSize="xs" color="green.400">Online</Text>}
                    </HStack>
                  </Box>
                </Collapse>
              </HStack>
            </MotionBox>
          </Tooltip>
        ))}
      </VStack>

      {/* ✅ Bottom Actions */}
      <Flex justify="space-between" p={4} borderTop="1px solid" borderColor={borderColor}>
        <IconButton icon={colorMode === "light" ? <FaMoon /> : <FaSun />} onClick={toggleColorMode} aria-label="Toggle Theme" variant="ghost" />
        {sidebarOpen && <Button leftIcon={<FaSignOutAlt />} size="sm" colorScheme="red" onClick={() => signOut()}>Logout</Button>}
      </Flex>
    </MotionBox>
  );
}
