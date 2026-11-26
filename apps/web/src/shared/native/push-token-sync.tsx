"use client";

import { useEffect, useState } from "react";

import { useMyInfo } from "@/features/auth/use-my-info";

import { isApp } from "./bridge";
import { registerPushToken } from "./register-push-token";

/**
 * 앱에서 로그인 상태가 확인되면 푸시 토큰을 조용히 다시 저장한다(PUT /push-tokens).
 * - 로그아웃할 때 서버에서 토큰을 지우므로, 다시 로그인하면 여기서 되살린다.
 * - 온보딩을 마친 계정만 보낸다. 온보딩 전에는 백엔드가 403으로 막고, 온보딩 완료 때 따로 등록한다.
 * - 알림 권한은 이 기기에서 한 번만 묻는다(prompt=true). 온보딩 때만 묻던 탓에 웹에서 먼저 가입했거나
 *   앱 설치 전에 온보딩을 마친 계정은 권한 팝업을 못 봐 푸시를 못 받았다. 그 뒤로는 묻지 않고(prompt=false)
 *   이미 허용한 경우에만 토큰을 저장한다. 거절했으면 다시 묻지 않는다(iOS도 한 번만 물을 수 있다).
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
  const userId = me?.onboarded ? me.userId : undefined;

  useEffect(() => {
    if (userId === undefined) return;
    const prompt = !wasPrompted();
    if (prompt) markPrompted();
    void registerPushToken({ prompt });
  }, [userId]);

  return null;
}

/** 이 기기에서 알림 권한을 물어봤는지 기억하는 키 */
const PROMPTED_KEY = "morak:push-permission-prompted";

/** 저장소를 못 쓰면(사생활 보호 모드 등) 물어본 적 없는 것으로 본다. 앱이 이미 답한 권한이면 팝업은 뜨지 않는다. */
const wasPrompted = () => {
  try {
    return localStorage.getItem(PROMPTED_KEY) === "1";
  } catch {
    return false;
  }
};

const markPrompted = () => {
  try {
    localStorage.setItem(PROMPTED_KEY, "1");
  } catch {
    // 저장하지 못하면 다음 실행 때 한 번 더 묻는다. 이미 답한 권한이면 OS가 팝업을 띄우지 않는다.
  }
};
