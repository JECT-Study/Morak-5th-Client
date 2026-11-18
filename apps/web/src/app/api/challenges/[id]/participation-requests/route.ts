import type { NextRequest } from "next/server";

import type { ParticipationRequestList } from "@/features/participation-request/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 방장이 보는 참여 신청 목록(GET /challenges/{id}/participation-requests).
 * status: PENDING(기본, 무효 신청 포함) | ACTIVE | REJECTED
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/challenges/[id]/participation-requests">,
) {
  const { id } = await params;
  const status = request.nextUrl.searchParams.get("status");
  const search = status ? `?${new URLSearchParams({ status })}` : "";
  return toRouteResponse(
    await backendFetch<ParticipationRequestList>(
      `/challenges/${encodeURIComponent(id)}/participation-requests${search}`,
    ),
  );
}
