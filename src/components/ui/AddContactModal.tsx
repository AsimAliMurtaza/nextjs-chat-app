// components/AddContactModal.tsx
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Input,
    Button,
  } from "@chakra-ui/react";
  
  interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    newContact: string;
    setNewContact: (value: string) => void;
    addContact: () => void;
    bgColor: string;
    textColor: string;
    cardBg: string;
  }
  
  export const AddContactModal = ({
    isOpen,
    onClose,
    newContact,
    setNewContact,
    addContact,
    bgColor,
    textColor,
    cardBg,
  }: AddContactModalProps) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>Add New Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter contact email..."
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              bg={cardBg}
              color={textColor}
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
    );
  };