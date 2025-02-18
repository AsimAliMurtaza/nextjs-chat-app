"use client";
import { useParams, useSearchParams } from "next/navigation";
import Chat from "@/components/ChatWindow";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recipientName = searchParams.get("name") || "Unknown User";

  return <Chat recipient={id} recipientName={recipientName} />;
};

export default ChatPage;
