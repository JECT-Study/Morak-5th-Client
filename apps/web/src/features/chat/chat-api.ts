import type { ApiResponse } from "@/shared/api/types";

import type { ChatMessage, ChatTicket } from "./type";

/** BFF 응답을 풀어서 data만 돌려준다. 실패하면 백엔드 에러 코드를 담아 던진다. */
async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, credentials: "same-origin" });
  const body = (await response.json()) as ApiResponse<T>;
  if (!body.success) throw new ChatApiError(response.status, body.error.code, body.error.message);
  return body.data;
}

export class ChatApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

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
