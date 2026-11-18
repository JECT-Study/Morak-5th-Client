import type { NextRequest } from "next/server";

import type { NotificationPage } from "@/features/notification/types";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/** 내 알림 목록(GET /notifications). before(이 id보다 오래된)·limit(기본 20, 최대 100)를 그대로 넘긴다. */
export async function GET(request: NextRequest) {
  const query = new URLSearchParams();
  for (const key of ["before", "limit"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const search = query.size > 0 ? `?${query}` : "";
  return toRouteResponse(await backendFetch<NotificationPage>(`/notifications${search}`));
}
