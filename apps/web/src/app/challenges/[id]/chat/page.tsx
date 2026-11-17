import { Suspense } from "react";

import ChatRoomScreen from "@/features/chat/components/chat-room";
import AppHeader from "@/shared/layout/app-header";

// TODO: 챌린지 상세 API가 나오면 제목을 챌린지 이름으로, 종료·퇴장 상태면 readOnly("ended" | "left")를 넘긴다.
export default function ChallengeChatPage() {
  return (
    <div className="bg-background-primary flex flex-1 flex-col">
      <AppHeader nested centered divider={false} title="채팅" />
      {/* 경로의 [id]를 읽는 부분은 요청마다 달라서 Suspense 안에서 렌더링한다 */}
      <Suspense>
        <ChatRoomScreen />
      </Suspense>
    </div>
  );
}
