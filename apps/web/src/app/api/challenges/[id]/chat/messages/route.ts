import type { NextRequest } from "next/server";

import type { ChatMessage } from "@/features/chat/type";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 채팅 메시지 조회(GET /challenges/{id}/chat/messages). 쿠키의 토큰을 붙여 백엔드로 넘긴다.
 * - 쿼리 없음: 최신 메시지부터 (채팅방 입장)
 * - before={id}: 그보다 오래된 메시지 (위로 스크롤)
 * - after={id}: 그보다 새 메시지 (재연결 후 빈틈 메우기)
 * - limit: 기본 30, 최대 100. 결과는 항상 id 오름차순
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/challenges/[id]/chat/messages">,
) {
  const { id } = await params;
  const query = new URLSearchParams();
  for (const key of ["before", "after", "limit"]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  const search = query.size > 0 ? `?${query}` : "";

  const result = await backendFetch<ChatMessage[]>(
    `/challenges/${encodeURIComponent(id)}/chat/messages${search}`,
  );
  return toRouteResponse(result);
}
