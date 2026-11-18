import type { NextRequest } from "next/server";

import type { ChallengePage } from "@/features/challenge/recruiting-types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 모집 중인 공개 챌린지 목록(GET /challenges).
 * category·keyword·cursor·size 쿼리를 그대로 넘긴다. size는 기본 20, 최대 100.
 */
export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["category", "keyword", "cursor", "size"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const search = query.size > 0 ? `?${query}` : "";
  return toRouteResponse(await backendFetch<ChallengePage>(`/challenges${search}`));
}

/**
 * 챌린지 개설(POST /challenges).
 * - JSON: 대표 사진 없이 개설
 * - multipart: challenge(JSON) + coverImage(사진 한 장, 5MB 이하)를 그대로 넘긴다
 */
export async function POST(request: Request) {
  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    const formData = await request.formData();
    return toRouteResponse(await backendFetch(`/challenges`, { method: "POST", formData }));
  }
  const body = await request.json();
  return toRouteResponse(await backendFetch(`/challenges`, { method: "POST", json: body }));
}
