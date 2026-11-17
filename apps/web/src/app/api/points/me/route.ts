import type { NextRequest } from "next/server";

import type { PointLedger } from "@/features/point/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 내 포인트 잔액과 거래 내역(GET /points/me). 최신순.
 * - before={id}: 그보다 오래된 거래 (다음 페이지는 응답의 nextCursor를 넘긴다)
 * - limit: 기본 20, 최대 100
 */
export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["before", "limit"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const search = query.size > 0 ? `?${query}` : "";
  return toRouteResponse(await backendFetch<PointLedger>(`/points/me${search}`));
}
