import type { AdStatus } from "@morak/bridge";

import { createUuid } from "@/shared/lib/uuid";

import { onAppMessage, sendToApp } from "./bridge";

/** 광고 불러오기와 시청이 끝날 때까지 기다린다. 이보다 늦으면 실패로 본다. */
const AD_RESULT_TIMEOUT_MS = 3 * 60_000;

type RequestRewardedAdOptions = {
  /** Spring 사용자 ID. 앱이 구글 SSV 옵션(userId)에 그대로 넣는다. */
  userId: string;
  /** 광고 시청 시작 API가 준 시청 토큰. 앱이 구글 SSV 옵션(customData)에 그대로 넣는다. */
  token: string;
  timeoutMs?: number;
};

/**
 * 앱에 보상형 광고를 요청하고 시청 결과를 기다린다.
 * 브라우저이면 unavailable, 앱이 답하지 않거나 시간이 지나면 failed.
 * rewarded여도 포인트는 구글이 서버로 보내는 알림(SSV)이 올 때 지급되므로 몇 초 늦을 수 있다.
 */
export function requestRewardedAd({
  userId,
  token,
  timeoutMs = AD_RESULT_TIMEOUT_MS,
}: RequestRewardedAdOptions): Promise<AdStatus> {
  return new Promise((resolve) => {
    const id = createUuid();

    const finish = (status: AdStatus) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(status);
    };

    const timer = setTimeout(() => finish("failed"), timeoutMs);
    const unsubscribe = onAppMessage((message) => {
      if (message.type !== "AD_RESULT" || message.id !== id) return;
      finish(message.status);
    });

    if (!sendToApp({ type: "SHOW_REWARDED_AD", id, userId, token })) finish("unavailable");
  });
}
