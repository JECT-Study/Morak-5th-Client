import type { PushStatus } from "@morak/bridge";

import { createUuid } from "@/shared/lib/uuid";

import { onAppMessage, sendToApp } from "./bridge";

export type PushTokenResult = { status: PushStatus; token: string | null };

const UNAVAILABLE: PushTokenResult = { status: "unavailable", token: null };

/** 권한 팝업에 사용자가 답하는 시간까지 기다린다. 이보다 늦으면 받을 수 없는 것으로 본다. */
const PUSH_TOKEN_TIMEOUT_MS = 60_000;

type RequestPushTokenOptions = {
  prompt: boolean;
  /** 앱 답을 기다리는 시간. 묻지 않고 토큰만 받을 때(로그아웃 등)는 짧게 준다. */
  timeoutMs?: number;
};

/**
 * 앱에 Expo 푸시 토큰을 요청한다.
 * - prompt=true: 아직 묻지 않았으면 권한 팝업을 띄운다(챌린지 참여·생성 등 이유가 분명할 때).
 * - prompt=false: 묻지 않고, 이미 허용된 경우에만 토큰을 받는다(로그인 직후 조용한 재등록).
 * 브라우저이거나, 앱이 답하지 않거나(푸시를 모르는 예전 앱), 시간이 지나면 unavailable.
 */
export function requestPushToken({
  prompt,
  timeoutMs = PUSH_TOKEN_TIMEOUT_MS,
}: RequestPushTokenOptions): Promise<PushTokenResult> {
  return new Promise((resolve) => {
    const id = createUuid();

    const finish = (result: PushTokenResult) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(result);
    };

    const timer = setTimeout(() => finish(UNAVAILABLE), timeoutMs);
    const unsubscribe = onAppMessage((message) => {
      if (message.type !== "PUSH_TOKEN" || message.id !== id) return;
      finish({ status: message.status, token: message.token });
    });

    if (!sendToApp({ type: "REQUEST_PUSH_TOKEN", id, prompt })) finish(UNAVAILABLE);
  });
}
