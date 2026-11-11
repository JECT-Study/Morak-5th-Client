import { Suspense } from "react";

import ChatRoomTest from "@/features/chat/components/chat-room-test";
import AppHeader from "@/shared/layout/app-header";

// TODO: 채팅방 디자인 시안이 나오면 테스트 화면(ChatRoomTest)을 교체한다.
export default function ChallengeChatPage() {
  return (
    <>
      <AppHeader nested title="채팅" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <ChatRoomTest />
      </Suspense>
    </>
  );
}
