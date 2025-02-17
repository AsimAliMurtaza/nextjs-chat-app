// components/BottomActions.tsx
import { Flex, IconButton, Button } from "@chakra-ui/react";
import { FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

const MotionIconButton = motion(IconButton);
const MotionButton = motion(Button);

interface BottomActionsProps {
  sidebarOpen: boolean;
  colorMode: string;
  toggleColorMode: () => void;
}

export const BottomActions = ({
  sidebarOpen,
  colorMode,
  toggleColorMode,
}: BottomActionsProps) => {
  return (
    <Flex justify="space-between" p={2}>
      <MotionIconButton
        icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
        onClick={toggleColorMode}
        aria-label="Toggle Theme"
        variant="ghost"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        borderRadius={"full"}
      />
      {sidebarOpen && (
        <MotionIconButton
          icon={<FaSignOutAlt />}
          size="sm"
          onClick={() => signOut()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          borderRadius={"full"}
        />
      )}
    </Flex>
  );
};
