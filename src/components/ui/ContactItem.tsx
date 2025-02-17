// components/ContactItem.tsx
import { Box, HStack, Avatar, Text, Tooltip, Collapse } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionBox = motion(Box);

interface ContactItemProps {
  user: {
    _id: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
  };
  sidebarOpen: boolean;
  isActive: boolean;
  highlightBg: string;
  cardBg: string;
}

export const ContactItem = ({
  user,
  sidebarOpen,
  isActive,
  highlightBg,
  cardBg,
}: ContactItemProps) => {
  const router = useRouter();

  return (
    <Tooltip
      label={user.username}
      placement="right"
      hasArrow
      isDisabled={sidebarOpen}
    >
      <MotionBox
        p={2}
        bg={isActive ? highlightBg : cardBg}
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={() =>
          router.push(
            `/conversations/${user._id}?name=${encodeURIComponent(
              user.username
            )}`
          )
        }
        w="full"
        boxShadow="sm"
        borderLeft="3px solid"
        borderLeftColor={isActive ? "blue.400" : "transparent"}
      >
        <HStack spacing={4} p={1} w="full">
          <Avatar
            name={user.username}
            src={user.avatar || ""}
            size={sidebarOpen ? "md" : "sm"}
          />
          <Collapse in={sidebarOpen} animateOpacity style={{ width: "100%" }}>
            <HStack justify="space-between" w="full">
              <Text fontSize="md" fontWeight="medium">
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
  );
};
