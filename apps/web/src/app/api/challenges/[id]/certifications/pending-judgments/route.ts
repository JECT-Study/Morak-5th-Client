import type { PendingJudgment } from "@/features/certification/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 내가 판정할 인증 목록(GET /challenges/{id}/certifications/pending-judgments). 제출 순. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/challenges/[id]/certifications/pending-judgments">,
) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<PendingJudgment[]>(
      `/challenges/${encodeURIComponent(id)}/certifications/pending-judgments`,
    ),
  );
}
