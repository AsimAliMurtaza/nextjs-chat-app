"use client";
import { useParams, useSearchParams } from "next/navigation";
import { Box, Text, useColorModeValue, Icon, Flex } from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons"; // You can use Chakra's built-in ChatIcon or a custom one
import Chat from "@/components/ChatWindow";

const ChatPage = () => {
  const bgColor = useColorModeValue("white", "#242424");
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get("name") || "Unknown User";

  return (
    <Box bg={bgColor} p={4} minH="100vh">
      {id ? (
        <Chat recipient={id} recipientName={recipientName} />
      ) : (
        <Flex
          direction="column"
          justify="center"
          align="center"
          minH="100vh"
          bg={bgColor}
          borderRadius="md"
          boxShadow="md"
          textAlign="center"
        >
          <Icon
            as={ChatIcon}
            boxSize={12}
            mb={4}
            color={useColorModeValue("gray.500", "gray.400")}
          />
          <Text fontSize="xl" color={useColorModeValue("gray.500", "gray.400")}>
            Start messaging with your friends or colleagues
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default ChatPage;
