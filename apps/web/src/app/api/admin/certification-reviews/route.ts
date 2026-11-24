import type { ReviewPage } from "@/features/admin-review/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 운영진 검수 목록(GET /admin/certification-reviews). 쿼리: certDate, challengeId, status. ADMIN 권한은 백엔드가 판단한다. */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return toRouteResponse(await backendFetch<ReviewPage>(`/admin/certification-reviews${search}`));
}
