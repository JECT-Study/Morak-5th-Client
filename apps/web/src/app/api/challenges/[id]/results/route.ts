import type { TeamResult } from "@/features/challenge-result/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 챌린지 팀 결과(GET /challenges/{id}/results). 참가자만, 결과 확정 전이면 409. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/challenges/[id]/results">,
) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<TeamResult>(`/challenges/${encodeURIComponent(id)}/results`),
  );
}
