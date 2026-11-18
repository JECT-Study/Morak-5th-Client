import type { NextRequest } from "next/server";

import type { MyParticipationPage } from "@/features/challenge/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 내 챌린지 목록(GET /users/me/participations).
 * status(HOME 기본 | ARCHIVE)·cursor·size 쿼리를 그대로 넘긴다.
 */
export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["status", "cursor", "size"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const search = query.size > 0 ? `?${query}` : "";
  return toRouteResponse(
    await backendFetch<MyParticipationPage>(`/users/me/participations${search}`),
  );
}
