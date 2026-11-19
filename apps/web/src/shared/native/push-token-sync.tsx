"use client";

import { useEffect, useState } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";

import { isApp } from "./bridge";
import { registerPushToken } from "./register-push-token";

/**
 * 앱에서 로그인 상태가 확인되면 푸시 토큰을 조용히 다시 저장한다(PUT /push-tokens).
 * - 로그아웃할 때 서버에서 토큰을 지우므로, 다시 로그인하면 여기서 되살린다.
 * - 권한은 묻지 않는다(prompt=false). 기기에서 이미 허용한 경우에만 토큰을 받아 저장한다.
 * - 계정이 바뀌면 다시 저장해 토큰 주인을 새 계정으로 바꾼다. 같은 토큰을 다시 보내도 결과는 같다.
 * 브라우저에서는 푸시를 받을 수 없어 아무것도 하지 않는다(내 정보도 부르지 않는다).
 */
export default function PushTokenSync() {
  // 브라우저에서만 판단할 수 있는 값이라 처음 그릴 때 한 번만 읽는다. 무엇을 그리든 화면에는 아무것도 없다.
  const [inApp] = useState(isApp);
  return inApp ? <SyncWhenLoggedIn /> : null;
}

function SyncWhenLoggedIn() {
  const { data: me } = useMyInfo();
  const userId = me?.userId;

  useEffect(() => {
    if (userId === undefined) return;
    void registerPushToken({ prompt: false });
  }, [userId]);

  return null;
}
