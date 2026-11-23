import type { RescheduledChallenge } from "@/features/challenge/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 시작 보류 챌린지 기간 재설정(POST /challenges/{id}/reschedule). 방장 전용. 본문: { startDate, endDate } */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/challenges/[id]/reschedule">,
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return toRouteResponse(
    await backendFetch<RescheduledChallenge>(`/challenges/${encodeURIComponent(id)}/reschedule`, {
      method: "POST",
      json: body,
    }),
  );
}
