import { request } from "@/shared/api/client";

import type { ChatMessage, ChatTicket } from "./type";

/** 웹소켓 연결용 1회용 티켓(30초). 연결·재연결 직전에 매번 새로 받는다. */
export const fetchChatTicket = () => request<ChatTicket>("/api/chat/ws-ticket", { method: "POST" });

type MessageCursor = { before?: number; after?: number; limit?: number };

/** 채팅 메시지 조회. 커서가 없으면 최신 메시지부터. 결과는 id 오름차순 */
export const fetchChatMessages = (challengeId: number, cursor: MessageCursor = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(cursor)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const search = query.size > 0 ? `?${query}` : "";
  return request<ChatMessage[]>(`/api/challenges/${challengeId}/chat/messages${search}`);
};
