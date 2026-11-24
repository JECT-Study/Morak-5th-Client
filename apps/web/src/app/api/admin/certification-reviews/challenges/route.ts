import type { ReviewChallengeOption } from "@/features/admin-review/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 검수 대상 챌린지 선택지(GET /admin/certification-reviews/challenges) */
export async function GET() {
  return toRouteResponse(
    await backendFetch<ReviewChallengeOption[]>("/admin/certification-reviews/challenges"),
  );
}
