import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 읽지 않은 알림 개수(GET /notifications/unread-count). 홈 종 아이콘 표시용 */
export async function GET() {
  return toRouteResponse(
    await backendFetch<{ unreadCount: number }>("/notifications/unread-count"),
  );
}
