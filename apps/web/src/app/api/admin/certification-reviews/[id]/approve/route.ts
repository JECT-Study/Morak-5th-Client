import type { ReviewDetail } from "@/features/admin-review/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 인증 승인(POST /admin/certification-reviews/{id}/approve). 이미 처리됐으면 409다. */
export async function POST(
  _: Request,
  { params }: RouteContext<"/api/admin/certification-reviews/[id]/approve">,
) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<ReviewDetail>(
      `/admin/certification-reviews/${encodeURIComponent(id)}/approve`,
      { method: "POST" },
    ),
  );
}
