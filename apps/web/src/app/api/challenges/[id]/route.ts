import type { ChallengeView } from "@/features/challenge/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 챌린지 상세(GET /challenges/{id}). 비공개 챌린지는 방장·참가자·신청자만 볼 수 있다. */
export async function GET(_: Request, { params }: RouteContext<"/api/challenges/[id]">) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<ChallengeView>(`/challenges/${encodeURIComponent(id)}`),
  );
}
