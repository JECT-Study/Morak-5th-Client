import type { ChatTicket } from "@/features/chat/type";
import { backendFetch, toRouteResponse } from "@/shared/api/backend";

/**
 * 웹소켓 연결용 1회용 티켓 발급(POST /chat/ws-ticket).
 * 브라우저는 토큰(HttpOnly 쿠키)을 읽을 수 없어서, BFF가 쿠키의 토큰으로 대신 받아 티켓만 넘긴다.
 * 티켓은 30초 동안 한 번만 쓸 수 있으므로 연결·재연결 직전에 매번 새로 요청한다.
 */
export async function POST() {
  const result = await backendFetch<ChatTicket>("/chat/ws-ticket", { method: "POST" });
  return toRouteResponse(result);
}
