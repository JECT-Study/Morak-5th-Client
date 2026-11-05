export type ChatMessage = {
  id: number; // message id
  senderId: number; //userId
  content: string; // 내용
  createdAt: string; // 생성일
};

export type SendChatMessage = Pick<ChatMessage, "content">;

/** POST /chat/ws-ticket 응답 data. ticket은 STOMP CONNECT 헤더 `ticket`으로 보낸다. */
export type ChatTicket = {
  ticket: string;
  /** 만료까지 남은 시간(초). 현재 30초 */
  expiresIn: number;
};
