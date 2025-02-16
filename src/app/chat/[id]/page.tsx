import Chat from "@/components/Chat";

const ChatPage = ({ params }: { params: { id: string } }) => {
  return <Chat recipient={params.id} />;
};

export default ChatPage;
