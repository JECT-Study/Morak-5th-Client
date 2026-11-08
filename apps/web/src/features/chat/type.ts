/** 보낸 사람. 탈퇴 등으로 찾을 수 없거나 SYSTEM 메시지면 메시지의 sender가 null이다. */
export type ChatSender = {
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
  /** 예) "HOST" */
  role: string;
};

/** 인증 스토리 답글일 때만 있다. 원본 인증을 찾을 수 없으면 authorNickname, certDate는 null */
export type ChatReply = {
  certificationId: number;
  authorNickname: string | null;
  /** YYYY-MM-DD */
  certDate: string | null;
};

/** 구독(/topic/challenges/{id}/chat)과 조회(GET …/chat/messages)로 받는 메시지 */
export type ChatMessage = {
  /** 서버가 붙인 번호. 오름차순이 시간순이며 중복 제거·커서(before/after) 기준 */
  id: number;
  /** USER: 참가자 메시지, SYSTEM: 서버 안내 메시지 */
  type: "USER" | "SYSTEM";
  /** 보낸 사람이 만든 번호표. 내가 보낸 메시지가 돌아왔는지 확인할 때 쓴다 */
  clientMessageId: string | null;
  sender: ChatSender | null;
  content: string | null;
  reply: ChatReply | null;
  /** ISO 8601 UTC. 화면에는 한국 시간으로 바꿔 보여준다 */
  createdAt: string;
};

/** SEND /app/challenges/{id}/chat 본문 */
export type SendChatMessage = {
  /** 프론트가 만든 UUID. 다시 보낼 때는 같은 값을 써야 중복으로 저장되지 않는다 */
  clientMessageId: string;
  /** 1~1000자 */
  content: string;
  replyCertificationId: number | null;
};

/** /user/queue/errors 로 오는 전송 실패. 요청을 읽지 못했으면 clientMessageId가 null */
export type ChatSendError = {
  clientMessageId: string | null;
  code: string;
  message: string;
};

/** 내가 보내고 결과를 기다리는(또는 실패한) 메시지 */
export type PendingMessage = SendChatMessage & {
  status: "sending" | "failed";
  /** 실패 이유 (전송 실패 코드 메시지, 응답 없음, 연결 끊김) */
  errorMessage?: string;
};

/** POST /chat/ws-ticket 응답 data. ticket은 STOMP CONNECT 헤더 `ticket`으로 보낸다. */
export type ChatTicket = {
  ticket: string;
  /** 만료까지 남은 시간(초). 현재 30초 */
  expiresIn: number;
};
