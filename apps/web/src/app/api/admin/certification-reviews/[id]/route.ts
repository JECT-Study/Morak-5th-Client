import type { ReviewDetail } from "@/features/admin-review/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 운영진 검수 상세(GET /admin/certification-reviews/{id}) */
export async function GET(
  _: Request,
  { params }: RouteContext<"/api/admin/certification-reviews/[id]">,
) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<ReviewDetail>(`/admin/certification-reviews/${encodeURIComponent(id)}`),
  );
}
