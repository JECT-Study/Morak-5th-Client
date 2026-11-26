import type { ChallengeView } from "@/features/challenge/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 초대 코드로 챌린지 상세 조회(GET /challenges/by-code/{code}). 합류하지 않고 상세만 본다.
 * 없는 코드 404, 종료·폐기 410, 여러 번 틀리면 429.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/challenges/by-code/[code]">,
) {
  const { code } = await params;
  return toRouteResponse(
    await backendFetch<ChallengeView>(`/challenges/by-code/${encodeURIComponent(code)}`),
  );
}
