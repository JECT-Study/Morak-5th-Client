import type { DiscardedChallenge } from "@/features/challenge/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 시작 보류 챌린지 폐기(POST /challenges/{id}/discard). 방장 전용. 참가자 포인트는 서버가 즉시 전액 반환한다. */
export async function POST(_: Request, { params }: RouteContext<"/api/challenges/[id]/discard">) {
  const { id } = await params;
  return toRouteResponse(
    await backendFetch<DiscardedChallenge>(`/challenges/${encodeURIComponent(id)}/discard`, {
      method: "POST",
    }),
  );
}
