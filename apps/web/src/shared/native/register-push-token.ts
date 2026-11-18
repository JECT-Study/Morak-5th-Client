import type { PushStatus } from "@morak/bridge";

import { request } from "@/shared/api/client";

import { requestPushToken } from "./push";

/**
 * 앱에서 Expo 푸시 토큰을 받아 서버에 등록한다(PUT /api/push-tokens).
 * - prompt=true: 아직 묻지 않았으면 권한 팝업을 띄운다(챌린지 생성처럼 이유가 분명할 때).
 * - prompt=false: 묻지 않고, 이미 허용된 경우에만 다시 등록한다.
 * 브라우저·거절·등록 실패여도 throw하지 않는다. 푸시는 부가 기능이라 본 흐름을 막지 않는다.
 * 권한 결과(status)를 돌려줘서, 필요하면 화면이 다음 안내(설정에서 켜기 등)를 정한다.
 */
export async function registerPushToken({ prompt }: { prompt: boolean }): Promise<PushStatus> {
  const { status, token } = await requestPushToken({ prompt });
  if (status === "granted" && token) {
    await request("/api/push-tokens", { method: "PUT", json: { token } }).catch(() => undefined);
  }
  return status;
}
