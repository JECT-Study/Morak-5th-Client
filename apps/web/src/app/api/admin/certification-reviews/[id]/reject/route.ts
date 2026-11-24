import type { ReviewDetail } from "@/features/admin-review/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 인증 거절(POST /admin/certification-reviews/{id}/reject). 본문: { reason }. 이미 처리됐으면 409다. */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/admin/certification-reviews/[id]/reject">,
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return toRouteResponse(
    await backendFetch<ReviewDetail>(
      `/admin/certification-reviews/${encodeURIComponent(id)}/reject`,
      { method: "POST", json: body },
    ),
  );
}
