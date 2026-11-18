"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { onAppMessage, sendToApp } from "./bridge";

/**
 * 앱 껍데기와의 연결 지점.
 * - 화면이 준비되면 READY를 보내 앱이 스플래시를 내리고 대기 중인 링크를 보내게 한다.
 * - 딥링크·푸시로 들어온 OPEN_URL을 받아 해당 경로로 이동한다.
 * - 앱을 보는 중에 푸시가 오면(PUSH_RECEIVED) 알림과, 알림으로 바뀌었을 수 있는
 *   내 챌린지·챌린지 상세를 다시 불러온다(승인되면 홈 카드가 생기는 등).
 */
export default function AppBridgeListener() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAppMessage((message) => {
      if (message.type === "OPEN_URL") router.push(message.path);
      if (message.type === "PUSH_RECEIVED") {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["users", "me", "participations"] });
        queryClient.invalidateQueries({ queryKey: ["challenges"] });
      }
    });
    sendToApp({ type: "READY" });
    return unsubscribe;
  }, [router, queryClient]);

  return null;
}
