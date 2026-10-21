"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { onAppMessage, sendToApp } from "./bridge";

/**
 * 앱 껍데기와의 연결 지점.
 * - 화면이 준비되면 READY를 보내 앱이 스플래시를 내리고 대기 중인 링크를 보내게 한다.
 * - 딥링크·푸시로 들어온 OPEN_URL을 받아 해당 경로로 이동한다.
 */
export default function AppBridgeListener() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAppMessage((message) => {
      if (message.type === "OPEN_URL") router.push(message.path);
    });
    sendToApp({ type: "READY" });
    return unsubscribe;
  }, [router]);

  return null;
}
