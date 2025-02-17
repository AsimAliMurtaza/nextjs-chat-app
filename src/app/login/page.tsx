"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Input,
  Button,
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  Container,
  Flex,
  useColorMode,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  // 🔥 Dynamic Theme Styling
  const bgColor = useColorModeValue(
    "linear(to-br, #E3F2FD, #FCE4EC)",
    "gray.900"
  );
  const cardBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const buttonBgColor = useColorModeValue("blue.500", "blue.400");
  const buttonHoverColor = useColorModeValue("blue.600", "blue.300");
  const githubColor = useColorModeValue("gray.900", "white");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // 👈 Change to false to handle redirect manually
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try again!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Redirecting to chat...",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      router.push("/"); // 👈 Redirect to the chat page
    }
  };

  return (
    <Flex justify="center" align="center" minH="100vh" bgGradient={bgColor}>
      <Container maxW="4xl" centerContent>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex
            overflow="hidden"
            direction={{ base: "column", md: "row" }}
            w="100%"
            maxW="800px"
            position="relative"
          >
            {/* 🌗 Dark Mode Toggle Button */}
            <IconButton
              aria-label="Toggle Dark Mode"
              icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
              position="absolute"
              top="4"
              right="4"
              onClick={toggleColorMode}
              bg="transparent"
              _hover={{ bg: "gray.300", _dark: { bg: "gray.600" } }}
            />

            {/* Left Section (Welcome Panel) */}
            <Box
              flex={1}
              bgGradient={bgColor}
              p={8}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
              color={textColor}
              borderRadius={{ base: "20px 20px 0 0", md: "20px 0 0 20px" }}
            >
              <Heading size="lg" fontWeight="thin" color={textColor}>
                Welcome to
              </Heading>
              <Heading size="2xl" fontWeight="bold" color={textColor} mb={4}>
                ChatSphere
              </Heading>
              <Text fontSize="md">Sign in to start chatting instantly!</Text>
              <Button
                color="blue.500"
                _hover={{ color: "blue.900" }}
                onClick={() => router.push("/")}
              >
                <FiArrowLeft
                  style={{
                    marginRight: "8px",
                    marginBottom: "2px",
                    fontSize: "2em",
                  }}
                />
              </Button>
            </Box>

            {/* Right Section (Login Form) */}
            <Box
              flex={1}
              p={8}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="20px"
            >
              <Heading size="md" fontWeight="lg" mb={6} color={textColor}>
                Sign in to ChatSphere
              </Heading>
              <VStack spacing={4} align="stretch">
                <FormControl id="signIn-email" isRequired>
                  <FormLabel fontSize="sm" color={textColor}>
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    bg={inputBgColor}
                    color={textColor}
                    border="1px solid #ccc"
                    onChange={handleInputChange}
                    name="email"
                    _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  />
                </FormControl>

                <FormControl id="signIn-password" isRequired>
                  <FormLabel fontSize="sm" color={textColor}>
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    bg={inputBgColor}
                    color={textColor}
                    border="1px solid #ccc"
                    onChange={handleInputChange}
                    name="password"
                    _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  />
                </FormControl>

                {error && (
                  <FormHelperText color="red.500" textAlign="center">
                    {error}
                  </FormHelperText>
                )}

                <Button
                  onClick={handleLogin}
                  bg={buttonBgColor}
                  _hover={{ bg: buttonHoverColor }}
                  isLoading={loading}
                  w="full"
                  size="md"
                >
                  Login
                </Button>

                <Text
                  fontSize="sm"
                  color="blue.500"
                  cursor="pointer"
                  textAlign="center"
                  _hover={{ textDecoration: "underline" }}
                >
                  Forgot password?
                </Text>

                <Divider my={4} />

                <VStack spacing={3} w="full">
                  <Button
                    variant="outline"
                    color="blue.500"
                    w="full"
                    leftIcon={<FcGoogle />}
                    _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                    onClick={() => signIn("google", { callbackUrl: "/chat" })}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    w="full"
                    color={githubColor}
                    leftIcon={<FaGithub />}
                    _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                    border="1px solid"
                    onClick={() => signIn("github", { callbackUrl: "/chat" })}
                  >
                    Continue with GitHub
                  </Button>
                </VStack>

                <Text fontSize="sm" mt={6} textAlign="center" color={textColor}>
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="link"
                    color="blue.500"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => router.push("/signup")}
                  >
                    Create one
                  </Button>
                </Text>
              </VStack>
            </Box>
          </Flex>
        </motion.div>
      </Container>
    </Flex>
  );
}
