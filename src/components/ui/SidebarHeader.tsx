// components/SidebarHeader.tsx
import { Flex, Text, IconButton } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

const MotionIconButton = motion(IconButton);

interface SidebarHeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  textColor: string;
}

export const SidebarHeader = ({
  sidebarOpen,
  toggleSidebar,
  textColor,
}: SidebarHeaderProps) => {
  return (
    <Flex justify="space-between" align="center" p={2} h={24}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Text
              fontSize="2xl"
              pl="2"
              fontWeight="semibold"
              bg={textColor}
              bgClip="text"
            >
              Messages
            </Text>
          </motion.div>
        )}
      </AnimatePresence>

      <MotionIconButton
        icon={<FaBars />}
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        variant="ghost"
        fontSize="md"
        borderRadius="full"
        animate={{ rotate: sidebarOpen ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      />
    </Flex>
  );
};
