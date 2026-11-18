import ChatList from "@/features/chat/components/chat-list";
import AppHeader from "@/shared/layout/app-header";

export default function ChatsPage() {
  return (
    <div className="bg-surface-secondary flex flex-1 flex-col">
      <AppHeader title="채팅" />
      <ChatList />
    </div>
  );
}
