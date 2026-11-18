import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 방장의 신청 처리. approve 승인 / reject 거절 / confirm-invalid 무효 신청 확인 */
const ACTIONS = new Set(["approve", "reject", "confirm-invalid"]);

export async function POST(
  _: Request,
  { params }: RouteContext<"/api/challenges/[id]/applications/[participationId]/[action]">,
) {
  const { id, participationId, action } = await params;
  if (!ACTIONS.has(action)) {
    return toRouteResponse({
      ok: false,
      status: 404,
      error: { code: "NOT_FOUND", message: "없는 요청입니다." },
    });
  }
  return toRouteResponse(
    await backendFetch(
      `/challenges/${encodeURIComponent(id)}/applications/${encodeURIComponent(participationId)}/${action}`,
      { method: "POST" },
    ),
  );
}
