import type { PushStatus } from "@morak/bridge";

import { onAppMessage, sendToApp } from "./bridge";

export type PushTokenResult = { status: PushStatus; token: string | null };

const UNAVAILABLE: PushTokenResult = { status: "unavailable", token: null };

/** 권한 팝업에 사용자가 답하는 시간까지 기다린다. 이보다 늦으면 받을 수 없는 것으로 본다. */
const PUSH_TOKEN_TIMEOUT_MS = 60_000;

/**
 * 앱에 알림 권한과 Expo 푸시 토큰을 요청한다.
 * 브라우저이거나, 앱이 답하지 않거나(푸시를 모르는 예전 앱), 시간이 지나면 unavailable.
 */
export function requestPushToken(): Promise<PushTokenResult> {
  return new Promise((resolve) => {
    const id = crypto.randomUUID();

    const finish = (result: PushTokenResult) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(result);
    };

    const timer = setTimeout(() => finish(UNAVAILABLE), PUSH_TOKEN_TIMEOUT_MS);
    const unsubscribe = onAppMessage((message) => {
      if (message.type !== "PUSH_TOKEN" || message.id !== id) return;
      finish({ status: message.status, token: message.token });
    });

    if (!sendToApp({ type: "REQUEST_PUSH_TOKEN", id })) finish(UNAVAILABLE);
  });
}
