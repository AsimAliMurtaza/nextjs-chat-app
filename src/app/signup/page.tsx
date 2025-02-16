"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Button,
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Text,
  Divider,
  useToast,
  Grid,
  GridItem,
  useColorMode,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("linear(to-br, #E0F7FA, #F3E5F5)", "gray.800");
  const boxColor = useColorModeValue("white", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const buttonHoverColor = useColorModeValue("blue.900", "blue.300");
  const inputBgColor = useColorModeValue("white", "gray.700");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "username") setUsername(value);
  };

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError("All fields are required!");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    setLoading(false);

    if (res.ok) {
      toast({
        title: "Account created!",
        description: "You can now log in.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/login");
    } else {
      setError("Signup failed! Try again.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgGradient={bgColor}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box bg={boxColor} borderRadius="20px" boxShadow="lg" maxW="900px" p={8} w="auto" h="auto">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            
            {/* Left Side Content */}
            <GridItem display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
              <Heading size="lg" fontWeight="thin" color={textColor}>
                Welcome to
              </Heading>
              <Heading size="2xl" fontWeight="bold" color={textColor} mb={4}>
                ChatSphere
              </Heading>
              <Text fontSize="sm" color={textColor} mt={4}>
                Create an account to start chatting in real-time!
              </Text>
              <Button color="blue.500" _hover={{ color: buttonHoverColor }} onClick={() => router.push("/")}>
                <FiArrowLeft style={{ marginRight: "8px", marginBottom: "2px", fontSize: "2em" }} />
              </Button>
            </GridItem>

            {/* Right Side - Sign Up Form */}
            <GridItem>
              <VStack spacing={5} align="stretch">
                {/* Color Mode Toggle Button */}
                <IconButton
                  aria-label="Toggle dark mode"
                  icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                  onClick={toggleColorMode}
                  alignSelf="flex-end"
                  variant="ghost"
                />

                {error && (
                  <Text color="red.500" fontSize="sm" textAlign="center">
                    {error}
                  </Text>
                )}

                <Heading size="md" fontWeight="lg" mb={4} color={textColor}>
                  Create your account
                </Heading>

                <FormControl id="signUp-username" isRequired>
                  <FormLabel fontSize="sm" color={textColor}>Username</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    bg={inputBgColor}
                    color="black"
                    border="1px solid #ccc"
                    onChange={handleInputChange}
                    name="username"
                    _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  />
                </FormControl>

                <FormControl id="signUp-email" isRequired>
                  <FormLabel fontSize="sm" color={textColor}>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    bg={inputBgColor}
                    color="black"
                    border="1px solid #ccc"
                    onChange={handleInputChange}
                    name="email"
                    _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  />
                </FormControl>

                <FormControl id="signUp-password" isRequired>
                  <FormLabel fontSize="sm" color={textColor}>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    bg={inputBgColor}
                    color="black"
                    border="1px solid #ccc"
                    onChange={handleInputChange}
                    name="password"
                    _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  />
                </FormControl>

                <Button onClick={handleSignup} bg="blue.500" color="white" _hover={{ bg: "blue.600" }} isLoading={loading} w="full">
                  Sign Up
                </Button>

                <Divider />

                <Text fontSize="sm" textAlign="center" color={textColor}>
                  Already have an account?{" "}
                  <Button variant="link" color="blue.500" onClick={() => router.push("/login")}>
                    Log in
                  </Button>
                </Text>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}
