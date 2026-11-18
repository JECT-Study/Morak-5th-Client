import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 안 읽은 내 알림 모두 읽음 처리(PATCH /notifications/read-all) */
export async function PATCH() {
  return toRouteResponse(await backendFetch("/notifications/read-all", { method: "PATCH" }));
}
