import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 챌린지 참가 지원(POST /challenges/{id}/applications). 본문: { message?, inviteCode? } */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/challenges/[id]/applications">,
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return toRouteResponse(
    await backendFetch<{ participationId: number }>(
      `/challenges/${encodeURIComponent(id)}/applications`,
      { method: "POST", json: body },
    ),
  );
}
