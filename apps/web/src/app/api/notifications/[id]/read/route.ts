import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 알림 한 건 읽음 처리(PATCH /notifications/{id}/read). 이미 읽었으면 그대로 성공 */
export async function PATCH(_: Request, { params }: RouteContext<"/api/notifications/[id]/read">) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }),
  );
}
