import type { AdRewardSession } from "@/features/ad/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 광고 시청을 시작하고 시청 토큰을 받는다(POST /ads/reward-sessions). 시작만으로는 횟수가 차감되지 않는다.
 * 오늘 보상을 다 받았으면 백엔드가 거절하고, 응답을 그대로 돌려준다.
 * 포인트는 여기서 지급하지 않는다. 광고를 끝까지 보면 구글이 서버로 보내는 알림(SSV)을 서버가 확인해 지급한다.
 */
export async function POST() {
  return toRouteResponse(
    await backendFetch<AdRewardSession>("/ads/reward-sessions", { method: "POST" }),
  );
}
