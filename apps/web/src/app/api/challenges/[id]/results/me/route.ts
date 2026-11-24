import type { MyResult } from "@/features/challenge-result/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 챌린지 내 결과(GET /challenges/{id}/results/me). 참가자만, 결과 확정 전이면 409. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/challenges/[id]/results/me">,
) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<MyResult>(`/challenges/${encodeURIComponent(id)}/results/me`),
  );
}
