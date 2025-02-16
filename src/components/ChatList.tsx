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
import { motion, AnimatePresence } from "framer-motion";

// Motion Wrapper for Smooth Animations
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);

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
  const bgColor = useColorModeValue("white", "black");
  const cardBg = useColorModeValue("white", "black");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const highlightBg = useColorModeValue("gray.100", "blue.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");

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
      borderColor={borderColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* ✅ Sidebar Header */}
      <Flex justify="space-between" align="center" p={2}>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, blue.400, purple.400)"
                bgClip="text"
              >
                ChatSphere
              </Text>
            </motion.div>
          )}
        </AnimatePresence>

        <MotionIconButton
          icon={<FaBars />}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
          variant="ghost"
          fontSize="md"
          borderRadius="full"
          animate={{ rotate: sidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        />
      </Flex>

      {/* ✅ Contact List */}
      <VStack spacing={0} align="stretch" flex="1">
        {contacts.map((user) => (
          <Tooltip
            label={user.username}
            placement="right"
            hasArrow
            isDisabled={sidebarOpen}
            key={user._id}
          >
            <MotionBox
              p={sidebarOpen ? 2 : 2}
              bg={pathname === `/chat/${user._id}` ? highlightBg : cardBg}
              cursor="pointer"
              whileHover={{ scale: 1.01 }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              onClick={() =>
                router.push(
                  `/chat/${user._id}?name=${encodeURIComponent(user.username)}`
                )
              }
              w="full"
            >
              <HStack spacing={3} w="full">
                <Avatar
                  name={user.username}
                  src={user.avatar || ""}
                  size={sidebarOpen ? "md" : "sm"}
                />
                <Collapse
                  in={sidebarOpen}
                  animateOpacity
                  style={{ width: "100%" }}
                >
                  <HStack justify="space-between" w="full">
                    <Text fontSize="lg" fontWeight="normal">
                      {user.username}
                    </Text>
                    {user.isOnline && (
                      <Text fontSize="xs" color="green.400">
                        Online
                      </Text>
                    )}
                  </HStack>
                </Collapse>
              </HStack>
            </MotionBox>
          </Tooltip>
        ))}
      </VStack>

      {/* ✅ Add Contact Button */}
      <Collapse in={sidebarOpen} animateOpacity>
        <HStack
          p={3}
          display="flex"
          justifyContent="right"
          borderRadius="md"
          mx={2}
          mb={2}
        >
          <MotionButton
            leftIcon={<FaPlus />}
            size="sm"
            onClick={onOpen}
            variant="outline"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Add Contact
          </MotionButton>
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

      {/* ✅ Bottom Actions */}
      <Flex
        justify="space-between"
        p={2}
      >
        <MotionIconButton
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          aria-label="Toggle Theme"
          variant="ghost"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        {sidebarOpen && (
          <MotionButton
            leftIcon={<FaSignOutAlt />}
            size="sm"
            onClick={() => signOut()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        )}
      </Flex>
    </MotionBox>
  );
}
